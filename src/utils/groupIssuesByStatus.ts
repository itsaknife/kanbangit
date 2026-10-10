import type { Issue, IssueStatus } from "@/types";

export type IssuesByStatus = Record<IssueStatus, Issue[]>;

/** Chia issue vào từng cột của bảng Kanban, issue mới cập nhật nằm trên cùng. */
export function groupIssuesByStatus(issues: Issue[]): IssuesByStatus {
  const groups: IssuesByStatus = { todo: [], in_progress: [], done: [] };

  for (const issue of issues) {
    groups[issue.status].push(issue);
  }
  for (const status of Object.keys(groups) as IssueStatus[]) {
    groups[status].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  return groups;
}
