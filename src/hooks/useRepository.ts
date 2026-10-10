"use client";

import { repositoryService } from "@/services";
import { useAsync } from "./useAsync";

/** Thông tin một repository (dùng cho tiêu đề trang). */
export function useRepository(repoId: number) {
  const { data, loading, error } = useAsync(() => repositoryService.getById(repoId), [repoId]);
  return { repository: data, loading, error };
}
