"use client";
import { create } from "zustand";
import { trackerService } from "@/services/tracker.service";
import type { Tracker, TrackerInput } from "@/types/tracker.types";
import { getErrorMessage } from "@/utils";
interface State {
  items: Tracker[];
  loading: boolean;
  loaded: boolean;
  busy: boolean;
  error: string | null;
  actionError: string | null;
}
interface TrackersStore {
  byRepository: Record<string, State>;
  fetch: (repoId: string, force?: boolean) => Promise<void>;
  save: (repoId: string, input: TrackerInput, id?: string) => Promise<void>;
  setActive: (repoId: string, id: string, active: boolean) => Promise<void>;
}
const empty = (): State => ({
  items: [],
  loading: false,
  loaded: false,
  busy: false,
  error: null,
  actionError: null,
});
const versions = new Map<string, number>();
export const useTrackersStore = create<TrackersStore>((set, get) => ({
  byRepository: {},
  fetch: async (repoId, force = false) => {
    const before = get().byRepository[repoId];
    if (!force && (before?.loaded || before?.loading)) return;
    const version = (versions.get(repoId) ?? 0) + 1;
    versions.set(repoId, version);
    const update = (data: Partial<State>) =>
      set((s) => ({
        byRepository: {
          ...s.byRepository,
          [repoId]: { ...empty(), ...s.byRepository[repoId], ...data },
        },
      }));
    update({ loading: true, error: null });
    try {
      const items = await trackerService.list(repoId);
      if (versions.get(repoId) === version) update({ items, loading: false, loaded: true });
    } catch (error) {
      if (versions.get(repoId) === version)
        update({ loading: false, loaded: true, error: getErrorMessage(error) });
    }
  },
  save: async (repoId, input, id) => {
    set((s) => ({
      byRepository: {
        ...s.byRepository,
        [repoId]: { ...empty(), ...s.byRepository[repoId], busy: true, actionError: null },
      },
    }));
    try {
      if (id) await trackerService.update(repoId, id, input);
      else await trackerService.create(repoId, input);
      await get().fetch(repoId, true);
    } catch (error) {
      set((s) => ({
        byRepository: {
          ...s.byRepository,
          [repoId]: { ...s.byRepository[repoId], actionError: getErrorMessage(error) },
        },
      }));
      throw error;
    } finally {
      set((s) => ({
        byRepository: { ...s.byRepository, [repoId]: { ...s.byRepository[repoId], busy: false } },
      }));
    }
  },
  setActive: async (repoId, id, active) => {
    set((s) => ({
      byRepository: {
        ...s.byRepository,
        [repoId]: { ...empty(), ...s.byRepository[repoId], busy: true, actionError: null },
      },
    }));
    try {
      await trackerService.setActive(repoId, id, active);
      await get().fetch(repoId, true);
    } catch (error) {
      set((s) => ({
        byRepository: {
          ...s.byRepository,
          [repoId]: { ...s.byRepository[repoId], actionError: getErrorMessage(error) },
        },
      }));
      throw error;
    } finally {
      set((s) => ({
        byRepository: { ...s.byRepository, [repoId]: { ...s.byRepository[repoId], busy: false } },
      }));
    }
  },
}));
