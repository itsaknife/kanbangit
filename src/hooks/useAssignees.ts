"use client";

import { repositoryService } from "@/services";
import { useAsync } from "./useAsync";

/** Danh sách người có thể được giao issue (dùng cho ô chọn người thực hiện trong form). */
export function useAssignees(repoId: number) {
  const { data, loading, error } = useAsync(() => repositoryService.getAssignees(repoId), [repoId]);
  return { assignees: data ?? [], loading, error };
}
