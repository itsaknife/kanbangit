import type { Repository, IssueAssignee } from "@/types";
import { http } from "./http";
import type { CreateRepositoryPayload, RepositoryMember } from "@/types/repository.types";
import type { AvailableRepository } from "@/types/repository.types";

export const repositoryService = {
  available: () => http.get<AvailableRepository[]>("/repositories/available"),
  import: (githubId: string) => http.post<Repository>("/repositories/import", { githubId }),
  transferOwner: (repoId: string, memberId: string) =>
    http.patch<{ message: string }>(`/repositories/${repoId}/owner`, { memberId }),
  create: (payload: CreateRepositoryPayload) => http.post<Repository>("/repositories", payload),
  getMembers: (repoId: string) => http.get<RepositoryMember[]>(`/repositories/${repoId}/members`),
  syncMembers: (repoId: string) =>
    http.post<RepositoryMember[]>(`/repositories/${repoId}/members/sync`),
  /** Danh sách repository của người dùng trên GitHub, kèm trạng thái đã kết nối hay chưa. */
  list: () => http.get<Repository[]>("/repositories"),

  getById: (repoId: string) => http.get<Repository>(`/repositories/${repoId}`),

  /** Những người có thể được giao issue trong repository. */
  getAssignees: (repoId: string) => http.get<IssueAssignee[]>(`/repositories/${repoId}/assignees`),
  /** Kết nối repository: backend lấy toàn bộ issue hiện có và đăng ký webhook. */
  connect: (repoId: string) => http.post<Repository>(`/repositories/${repoId}/connect`),
};
