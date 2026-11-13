"use client";
import { create } from "zustand";
import { repositoryService } from "@/services";
import type { IssueAssignee } from "@/types";
import { getErrorMessage } from "@/utils";
interface Entry {
  items: IssueAssignee[];
  loading: boolean;
  error: string | null;
}
interface Store {
  byRepository: Record<string, Entry>;
  fetch: (repoId: string) => Promise<void>;
}
const versions = new Map<string, number>();
export const useAssigneesStore = create<Store>((set) => ({
  byRepository: {},
  fetch: async (repoId) => {
    const version = (versions.get(repoId) ?? 0) + 1;
    versions.set(repoId, version);
    set((s) => ({
      byRepository: {
        ...s.byRepository,
        [repoId]: { items: s.byRepository[repoId]?.items ?? [], loading: true, error: null },
      },
    }));
    try {
      const items = await repositoryService.getAssignees(repoId);
      if (versions.get(repoId) === version)
        set((s) => ({
          byRepository: { ...s.byRepository, [repoId]: { items, loading: false, error: null } },
        }));
    } catch (error) {
      if (versions.get(repoId) === version)
        set((s) => ({
          byRepository: {
            ...s.byRepository,
            [repoId]: {
              items: s.byRepository[repoId]?.items ?? [],
              loading: false,
              error: getErrorMessage(error),
            },
          },
        }));
    }
  },
}));
