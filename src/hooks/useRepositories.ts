"use client";

import { repositoryService } from "@/services";
import { useAsync } from "./useAsync";

/** Danh sách repository của người dùng và thao tác kết nối repository. */
export function useRepositories() {
  const { data, loading, error, reload, setData } = useAsync(() => repositoryService.list(), []);

  const connect = async (repoId: number) => {
    const updated = await repositoryService.connect(repoId);
    setData((list) => list?.map((repo) => (repo.id === repoId ? updated : repo)));
  };

  return { repositories: data ?? [], loading, error, reload, connect };
}
