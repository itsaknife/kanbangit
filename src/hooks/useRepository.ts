"use client";
import { useEffect } from "react";
import { useRepositoriesStore } from "@/stores/repositories.store";
export function useRepository(repoId: string) {
  const entry = useRepositoriesStore((s) => s.details[repoId]);
  const fetch = useRepositoriesStore((s) => s.fetchRepository);
  useEffect(() => {
    void fetch(repoId);
  }, [repoId, fetch]);
  return {
    repository: entry?.data,
    loading: !entry?.loaded,
    error: entry?.error,
    reload: () => fetch(repoId, true),
  };
}
