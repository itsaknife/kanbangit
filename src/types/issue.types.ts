import type { UserSummary } from "./user.types";

/** Trạng thái hiển thị trên bảng Kanban. */
export type IssueStatus = "todo" | "in_progress" | "done";

/** Trạng thái gốc của issue trên GitHub. */
export type IssueState = "open" | "closed";

export interface IssueLabel {
  name: string;
  /** Mã màu hex không có dấu #, ví dụ "d73a4a". */
  color: string;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: IssueState;
  status: IssueStatus;
  labels: IssueLabel[];
  assignees: UserSummary[];
  author: UserSummary | null;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

/** Bộ lọc dùng chung cho bảng Kanban và danh sách issue. "all" nghĩa là không lọc. */
export interface IssueFilters {
  search: string;
  label: string;
  assignee: string;
}

export interface CreateIssuePayload {
  title: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
}

export type UpdateIssuePayload = Partial<CreateIssuePayload>;

/** Payload của socket event issue:created và issue:updated. */
export interface IssueEventPayload {
  repoId: number;
  issue: Issue;
}

/** Payload của socket event issue:deleted. */
export interface IssueDeletedPayload {
  repoId: number;
  number: number;
}
