"use client";
import { useEffect } from "react";
import { useRepositoriesStore } from "@/stores";
export function useRepositories() {
  const repositories = useRepositoriesStore((state) => state.repositories);
  const loading = useRepositoriesStore((state) => state.loading);
  const error = useRepositoriesStore((state) => state.error);
  const fetchRepositories = useRepositoriesStore((state) => state.fetchRepositories);
  const connect = useRepositoriesStore((state) => state.connectRepository);
  const loaded = useRepositoriesStore((state) => state.loaded);
  const createRepository = useRepositoriesStore((state) => state.createRepository);
  useEffect(() => {
    if (!loaded && !loading) void fetchRepositories();
  }, [loaded, loading, fetchRepositories]);
  return { repositories, loading, error, reload: fetchRepositories, connect, createRepository };
}
