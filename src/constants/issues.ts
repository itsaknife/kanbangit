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
  verified: {
    badge: "border-teal-500/25 bg-teal-500/10 text-teal-700 dark:text-teal-300",
    accent: "border-t-teal-500",
    dot: "bg-teal-500",
  },
  closed: {
    badge: "border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-300",
    accent: "border-t-slate-500",
    dot: "bg-slate-500",
  },
  reopen: {
    badge: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    accent: "border-t-violet-500",
    dot: "bg-violet-500",
  },
  rejected: {
    badge: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
    accent: "border-t-red-500",
    dot: "bg-red-500",
  },
  paused: {
    badge: "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300",
    accent: "border-t-orange-500",
    dot: "bg-orange-500",
  },
  canceled: {
    badge: "border-zinc-500/25 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
    accent: "border-t-zinc-500",
    dot: "bg-zinc-500",
  },
} as const;

export const DEFAULT_ISSUE_FILTERS: IssueFilters = {
  search: "",
  status: ALL,
  trackerId: ALL,
  assignee: ALL,
  dueFrom: "",
  dueTo: "",
};
