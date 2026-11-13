import { ALL } from "@/constants";
import type { Issue, IssueFilters } from "@/types";

/** Lọc issue theo mã, tiêu đề, số GitHub, tracker và người được giao. */
export function filterIssues(issues: Issue[], filters: IssueFilters): Issue[] {
  const keyword = filters.search.trim().toLowerCase().replace(/^#/, "");

  return issues.filter((issue) => {
    if (keyword) {
      const matchTitle = issue.title.toLowerCase().includes(keyword);
      const matchBody = issue.body?.toLowerCase().includes(keyword) ?? false;
      const matchNumber = issue.number !== null && String(issue.number) === keyword;
      const matchCode = issue.issueCode.toLowerCase().includes(keyword);
      if (!matchTitle && !matchNumber && !matchCode && !matchBody) return false;
    }
    if (filters.status !== ALL && issue.status !== filters.status) return false;
    if (filters.trackerId !== ALL && issue.trackerId !== filters.trackerId) {
      return false;
    }
    if (
      filters.assignee !== ALL &&
      !issue.assignees.some((assignee) => assignee.login === filters.assignee)
    ) {
      return false;
    }
    if (filters.dueFrom && (!issue.endDate || issue.endDate < filters.dueFrom)) return false;
    if (filters.dueTo && (!issue.endDate || issue.endDate > filters.dueTo)) return false;
    return true;
  });
}
