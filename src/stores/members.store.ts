"use client";
import { create } from "zustand";
import { repositoryService } from "@/services";
import { useRepositoriesStore } from "./repositories.store";
import type { RepositoryMember } from "@/types/repository.types";
import { getErrorMessage } from "@/utils";
interface Entry {
  members: RepositoryMember[];
  canManage: boolean;
  loading: boolean;
  busy: boolean;
  error: string | null;
}
interface Store {
  byRepository: Record<string, Entry>;
  fetch: (id: string) => Promise<void>;
  sync: (id: string) => Promise<void>;
  transfer: (id: string, memberId: string) => Promise<boolean>;
}
const empty = (): Entry => ({
  members: [],
  canManage: false,
  loading: false,
  busy: false,
  error: null,
});
const versions = new Map<string, number>();
export const useMembersStore = create<Store>((set, get) => {
  const update = (id: string, data: Partial<Entry>) =>
    set((s) => ({
      byRepository: { ...s.byRepository, [id]: { ...empty(), ...s.byRepository[id], ...data } },
    }));
  return {
    byRepository: {},
    fetch: async (id) => {
      const version = (versions.get(id) ?? 0) + 1;
      versions.set(id, version);
      update(id, { loading: true, error: null });
      try {
        const [members, repo] = await Promise.all([
          repositoryService.getMembers(id),
          repositoryService.getById(id),
        ]);
        if (versions.get(id) === version)
          update(id, { members, canManage: repo.canManage, loading: false });
      } catch (error) {
        if (versions.get(id) === version)
          update(id, { error: getErrorMessage(error), loading: false });
      }
    },
    sync: async (id) => {
      update(id, { busy: true, error: null });
      try {
        await repositoryService.syncMembers(id);
        await get().fetch(id);
      } catch (error) {
        update(id, { error: getErrorMessage(error) });
      } finally {
        update(id, { busy: false });
      }
    },
    transfer: async (id, memberId) => {
      update(id, { busy: true, error: null });
      try {
        await repositoryService.transferOwner(id, memberId);
        await useRepositoriesStore.getState().fetchRepository(id, true);
        await get().fetch(id);
        return true;
      } catch (error) {
        update(id, { error: getErrorMessage(error) });
        return false;
      } finally {
        update(id, { busy: false });
      }
    },
  };
});
