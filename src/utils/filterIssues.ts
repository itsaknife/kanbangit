import { ALL } from "@/constants";
import type { Issue, IssueFilters } from "@/types";

/** Lọc issue theo mã, tiêu đề, số GitHub, tracker và người được giao. */
export function filterIssues(issues: Issue[], filters: IssueFilters): Issue[] {
  const keyword = filters.search.trim().toLowerCase().replace(/^#/, "");

  return issues.filter((issue) => {
    if (keyword) {
      const matchTitle = issue.title.toLowerCase().includes(keyword);
      const matchNumber = String(issue.number) === keyword;
      const matchCode = issue.issueCode.toLowerCase().includes(keyword);
      if (!matchTitle && !matchNumber && !matchCode) return false;
    }
    if (filters.trackerId !== ALL && issue.trackerId !== filters.trackerId) {
      return false;
    }
    if (
      filters.assignee !== ALL &&
      !issue.assignees.some((assignee) => assignee.login === filters.assignee)
    ) {
      return false;
    }
    if (filters.dueFrom && (!issue.dueDate || issue.dueDate < filters.dueFrom)) return false;
    if (filters.dueTo && (!issue.dueDate || issue.dueDate > `${filters.dueTo}T23:59:59`))
      return false;
    return true;
  });
}
