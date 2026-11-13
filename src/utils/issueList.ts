import type { Issue } from "@/types";

/** Thêm issue vào danh sách, hoặc thay thế nếu đã có (so theo UUID). */
export function upsertIssue(issues: Issue[], issue: Issue): Issue[] {
  const exists = issues.some((item) => item.id === issue.id);
  if (!exists) return [issue, ...issues];
  return issues.map((item) => (item.id === issue.id ? issue : item));
}

export function removeIssue(issues: Issue[], issueId: string): Issue[] {
  return issues.filter((item) => item.id !== issueId);
}

/** Danh sách tài khoản được giao việc (không trùng, sắp xếp A-Z). */
export function getAssigneeLogins(issues: Issue[]): string[] {
  const logins = new Set<string>();
  for (const issue of issues) {
    for (const assignee of issue.assignees) logins.add(assignee.login);
  }
  return [...logins].sort((a, b) => a.localeCompare(b));
}
