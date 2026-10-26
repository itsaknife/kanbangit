import type { Repository, UserSummary } from "@/types";
import { http } from "./http";

export const repositoryService = {
  /** Danh sách repository của người dùng trên GitHub, kèm trạng thái đã kết nối hay chưa. */
  list: () => http.get<Repository[]>("/repositories"),

  getById: (repoId: number) => http.get<Repository>(`/repositories/${repoId}`),

  /** Những người có thể được giao issue trong repository. */
  // getAssignees: (repoId: number) => http.get<UserSummary[]>(`/repositories/${repoId}/assignees`),
  getAssignees: (repoId: number) => {
    return http.get<UserSummary[]>(`/repositories/${repoId}/assignees`);
  },

  /** Kết nối repository: backend lấy toàn bộ issue hiện có và đăng ký webhook. */
  connect: (repoId: number) => http.post<Repository>(`/repositories/${repoId}/connect`),
};
