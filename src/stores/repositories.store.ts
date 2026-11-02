"use client";
import { create } from "zustand";
import { repositoryService } from "@/services";
import type { Repository } from "@/types";
import { getErrorMessage } from "@/utils";
interface RepositoriesStore {
  repositories: Repository[];
  loading: boolean;
  error: string | null;
  isConnecting: number | null;
  fetchRepositories: () => Promise<void>;
  connectRepository: (repoId: number) => Promise<void>;
}
export const useRepositoriesStore = create<RepositoriesStore>((set) => ({
  repositories: [],
  loading: false,
  error: null,
  isConnecting: null,
  fetchRepositories: async () => {
    set({ loading: true, error: null });
    try {
      set({ repositories: await repositoryService.list(), loading: false });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    }
  },
  connectRepository: async (repoId) => {
    set({ isConnecting: repoId, error: null });
    try {
      const updated = await repositoryService.connect(repoId);
      set((s) => ({
        repositories: s.repositories.map((repo) => (repo.id === repoId ? updated : repo)),
        isConnecting: null,
      }));
    } catch (error) {
      set({ isConnecting: null, error: getErrorMessage(error) });
      throw error;
    }
  },
}));
