import type { Issue } from "@/types";

/** Thêm issue vào danh sách, hoặc thay thế nếu đã có (so theo số issue). */
export function upsertIssue(issues: Issue[], issue: Issue): Issue[] {
  const exists = issues.some((item) => item.number === issue.number);
  if (!exists) return [issue, ...issues];
  return issues.map((item) => (item.number === issue.number ? issue : item));
}

export function removeIssue(issues: Issue[], issueNumber: number): Issue[] {
  return issues.filter((item) => item.number !== issueNumber);
}

/** Danh sách tài khoản được giao việc (không trùng, sắp xếp A-Z). */
export function getAssigneeLogins(issues: Issue[]): string[] {
  const logins = new Set<string>();
  for (const issue of issues) {
    for (const assignee of issue.assignees) logins.add(assignee.login);
  }
  return [...logins].sort((a, b) => a.localeCompare(b));
}
