import type { CreateIssuePayload, Issue, IssueStatus, UpdateIssuePayload } from "@/types";
import { http } from "./http";

export const issueService = {
  list: (repoId: number) => http.get<Issue[]>(`/repositories/${repoId}/issues`),

  getByNumber: (repoId: number, issueNumber: number) =>
    http.get<Issue>(`/repositories/${repoId}/issues/${issueNumber}`),

  /** Tạo issue: backend tạo trên GitHub rồi lưu bản sao vào database. */
  create: (repoId: number, payload: CreateIssuePayload) =>
    http.post<Issue>(`/repositories/${repoId}/issues`, payload),

  update: (repoId: number, issueNumber: number, payload: UpdateIssuePayload) =>
    http.patch<Issue>(`/repositories/${repoId}/issues/${issueNumber}`, payload),

  /** Đổi cột trên bảng Kanban: backend cập nhật nhãn/trạng thái issue bên GitHub. */
  updateStatus: (repoId: number, issueNumber: number, status: IssueStatus) =>
    http.patch<Issue>(`/repositories/${repoId}/issues/${issueNumber}/status`, { status }),
};
