"use client";
import { create } from "zustand";
import { repositoryService } from "@/services";
import type { Repository } from "@/types";
import type { CreateRepositoryPayload } from "@/types/repository.types";
import type { AvailableRepository } from "@/types/repository.types";
import { getErrorMessage } from "@/utils";
interface RepositoriesStore {
  details: Record<
    string,
    { data?: Repository; loading: boolean; loaded: boolean; error: string | null }
  >;
  fetchRepository: (repoId: string, force?: boolean) => Promise<void>;
  available: AvailableRepository[];
  discoveryLoading: boolean;
  discoveryError: string | null;
  fetchAvailable: () => Promise<void>;
  importRepository: (githubId: string) => Promise<void>;
  loaded: boolean;
  createRepository: (payload: CreateRepositoryPayload) => Promise<void>;
  repositories: Repository[];
  loading: boolean;
  error: string | null;
  isConnecting: string | null;
  fetchRepositories: (background?: boolean) => Promise<void>;
  connectRepository: (repoId: string) => Promise<void>;
}
const detailVersions = new Map<string, number>();
export const useRepositoriesStore = create<RepositoriesStore>((set) => ({
  details: {},
  fetchRepository: async (repoId, force = false) => {
    let skip = false;
    set((s) => {
      const current = s.details[repoId];
      if (!force && (current?.loading || current?.loaded)) {
        skip = true;
        return s;
      }
      return {
        details: {
          ...s.details,
          [repoId]: { ...current, loading: true, loaded: false, error: null },
        },
      };
    });
    if (skip) return;
    const version = (detailVersions.get(repoId) ?? 0) + 1;
    detailVersions.set(repoId, version);
    try {
      const data = await repositoryService.getById(repoId);
      if (detailVersions.get(repoId) !== version) return;
      set((s) => ({
        details: { ...s.details, [repoId]: { data, loading: false, loaded: true, error: null } },
      }));
    } catch (error) {
      if (detailVersions.get(repoId) !== version) return;
      set((s) => ({
        details: {
          ...s.details,
          [repoId]: {
            ...s.details[repoId],
            loading: false,
            loaded: true,
            error: getErrorMessage(error),
          },
        },
      }));
    }
  },
  available: [],
  discoveryLoading: false,
  discoveryError: null,
  fetchAvailable: async () => {
    set({ discoveryLoading: true, discoveryError: null });
    try {
      set({ available: await repositoryService.available() });
    } catch (error) {
      set({ discoveryError: getErrorMessage(error) });
    } finally {
      set({ discoveryLoading: false });
    }
  },
  importRepository: async (githubId) => {
    const repository = await repositoryService.import(githubId);
    set((s) => ({
      repositories: [repository, ...s.repositories.filter((r) => r.id !== repository.id)],
      available: s.available.filter((r) => r.githubId !== githubId),
    }));
  },
  loaded: false,
  createRepository: async (payload) => {
    const repository = await repositoryService.create(payload);
    set((s) => ({
      repositories: [repository, ...s.repositories.filter((r) => r.id !== repository.id)],
    }));
  },
  repositories: [],
  loading: false,
  error: null,
  isConnecting: null,
  fetchRepositories: async (background = false) => {
    set({ loading: !background, error: null });
    try {
      set({ repositories: await repositoryService.list(), loading: false, loaded: true });
    } catch (error) {
      set({ loading: false, loaded: true, error: getErrorMessage(error) });
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
