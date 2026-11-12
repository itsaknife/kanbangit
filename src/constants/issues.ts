import type { IssueFilters } from "@/types";

/** Giá trị "không lọc" của các ô chọn. */
export const ALL = "all";

export const STATUS_STYLES = {
  todo: {
    badge: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    accent: "border-t-amber-500",
    dot: "bg-amber-500",
  },
  in_progress: {
    badge: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    accent: "border-t-blue-500",
    dot: "bg-blue-500",
  },
  done: {
    badge: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    accent: "border-t-emerald-500",
    dot: "bg-emerald-500",
  },
} as const;

export const DEFAULT_ISSUE_FILTERS: IssueFilters = {
  search: "",
  trackerId: ALL,
  assignee: ALL,
  dueFrom: "",
  dueTo: "",
};
