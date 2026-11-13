import type { UserSummary } from "./user.types";
export type IssueStatus =
  | "todo"
  | "in_progress"
  | "done"
  | "verified"
  | "closed"
  | "reopen"
  | "rejected"
  | "paused"
  | "canceled";
export type IssueState = "open" | "closed";
export interface IssueLabel {
  name: string;
  color: string;
}
export interface IssueParent {
  id: string;
  issueCode: string;
  title: string;
}
export interface Issue {
  id: string;
  issueCode: string;
  trackerId: string;
  number: number | null;
  title: string;
  body: string | null;
  state: IssueState;
  status: IssueStatus;
  labels: IssueLabel[];
  assignees: UserSummary[];
  assigneeId: string | null;
  author: UserSummary | null;
  htmlUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  closedAt: string | null;
  startDate: string | null;
  endDate: string | null;
  estimateMinutes: number | null;
  parentId: string | null;
  parent?: IssueParent | null;
  combinedEstimateMinutes: number | null;
  subIssueEstimateMinutes: number;
  syncStatus: string;
}
export interface IssueFilters {
  status: IssueStatus | "all";
  search: string;
  trackerId: string;
  assignee: string;
  dueFrom: string;
  dueTo: string;
}
export interface CreateIssuePayload {
  trackerId: string;
  title: string;
  body?: string;
  assigneeId?: string | null;
  status?: IssueStatus;
  startDate?: string | null;
  endDate?: string | null;
  estimateMinutes?: number | null;
  parentId?: string | null;
}
export type UpdateIssuePayload = Partial<CreateIssuePayload>;
export interface IssueListResponse {
  data: Issue[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface IssueEventPayload {
  repoId: string;
  issue: Issue;
}
export interface IssueDeletedPayload {
  repoId: string;
  id: string;
}
