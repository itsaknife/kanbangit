import type { Repository, IssueAssignee } from "@/types";
import { http } from "./http";
import type { CreateRepositoryPayload, RepositoryMember } from "@/types/repository.types";
import type { AvailableRepository } from "@/types/repository.types";

export const repositoryService = {
  available: () => http.get<AvailableRepository[]>("/github/projects/available"),
  import: (githubId: string) => http.post<Repository>("/github/projects/import", { githubId }),
  transferOwner: (repoId: string, memberId: string) =>
    http.patch<{ message: string }>(`/projects/${repoId}/owner`, { memberId }),
  create: (payload: CreateRepositoryPayload) =>
    http.post<Repository>(
      payload.providerType === "KANBANGIT" ? "/projects" : "/github/projects",
      payload.providerType === "KANBANGIT"
        ? { name: payload.name, description: payload.description }
        : { name: payload.name, description: payload.description, visibility: payload.visibility },
    ),
  getMembers: (repoId: string) => http.get<RepositoryMember[]>(`/projects/${repoId}/members`),
  syncMembers: (repoId: string) =>
    http.post<RepositoryMember[]>(`/projects/${repoId}/members/sync`),
  /** Danh sách repository của người dùng trên GitHub, kèm trạng thái đã kết nối hay chưa. */
  list: () => http.get<Repository[]>("/projects"),

  getById: (repoId: string) => http.get<Repository>(`/projects/${repoId}`),

  /** Những người có thể được giao issue trong repository. */
  getAssignees: (repoId: string) => http.get<IssueAssignee[]>(`/projects/${repoId}/assignees`),
  /** Kết nối repository: backend lấy toàn bộ issue hiện có và đăng ký webhook. */
  connect: (repoId: string) => http.post<Repository>(`/projects/${repoId}/connect`),
};
