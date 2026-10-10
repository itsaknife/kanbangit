import { ALL } from "@/constants";
import type { Issue, IssueFilters } from "@/types";

/** Lọc issue theo từ khóa (tiêu đề hoặc số #), nhãn và người được giao. */
export function filterIssues(issues: Issue[], filters: IssueFilters): Issue[] {
  const keyword = filters.search.trim().toLowerCase().replace(/^#/, "");

  return issues.filter((issue) => {
    if (keyword) {
      const matchTitle = issue.title.toLowerCase().includes(keyword);
      const matchNumber = String(issue.number) === keyword;
      if (!matchTitle && !matchNumber) return false;
    }
    if (filters.label !== ALL && !issue.labels.some((label) => label.name === filters.label)) {
      return false;
    }
    if (
      filters.assignee !== ALL &&
      !issue.assignees.some((assignee) => assignee.login === filters.assignee)
    ) {
      return false;
    }
    return true;
  });
}
