import type {
  CreateIssuePayload,
  Issue,
  IssueListResponse,
  IssueStatus,
  UpdateIssuePayload,
} from "@/types";
import { http } from "./http";
const path = (repoId: string, id: string) => `/repositories/${repoId}/issues/${id}`;
export const issueService = {
  // Board grouping and client filters require the complete repository list.
  list: async (repoId: string): Promise<Issue[]> => {
    const issues: Issue[] = [];
    let page = 1;
    let totalPages: number;
    do {
      const response = await http.get<IssueListResponse | Issue[]>(
        `/repositories/${repoId}/issues`,
        {
          page,
          limit: 200,
        },
      );
      // Support the unpaginated contract while an existing backend process is upgraded.
      if (Array.isArray(response)) {
        if (page !== 1)
          throw new Error(
            "API đã đổi cấu trúc dữ liệu trong lúc tải danh sách issue. Hãy tải lại.",
          );
        return response;
      }
      if (
        !response ||
        !Array.isArray(response.data) ||
        !response.pagination ||
        !Number.isSafeInteger(response.pagination.totalPages) ||
        response.pagination.totalPages < 0
      ) {
        throw new Error(
          "API danh sách issue trả dữ liệu không hợp lệ. Hãy khởi động lại backend rồi thử lại.",
        );
      }
      issues.push(...response.data);
      totalPages = response.pagination.totalPages;
      page += 1;
    } while (page <= totalPages);
    return issues;
  },
  getById: (repoId: string, id: string) => http.get<Issue>(path(repoId, id)),
  create: (repoId: string, payload: CreateIssuePayload) =>
    http.post<Issue>(`/repositories/${repoId}/issues`, payload),
  update: (repoId: string, id: string, payload: UpdateIssuePayload) =>
    http.patch<Issue>(path(repoId, id), payload),
  updateStatus: (repoId: string, id: string, status: IssueStatus) =>
    http.patch<Issue>(`${path(repoId, id)}/status`, { status }),
  cascadeClose: (repoId: string, id: string) =>
    http.post<unknown>(`${path(repoId, id)}/cascade-close`),
  setParent: (repoId: string, id: string, parentId: string | null) =>
    http.put<unknown>(`${path(repoId, id)}/parent`, { parentId }),
  removeParent: (repoId: string, id: string) => http.delete<unknown>(`${path(repoId, id)}/parent`),
  subIssues: (repoId: string, id: string) => http.get<Issue[]>(`${path(repoId, id)}/sub-issues`),
};
