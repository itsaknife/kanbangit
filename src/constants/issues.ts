import type { IssueFilters } from "@/types";

/** Giá trị "không lọc" của các ô chọn. */
export const ALL = "all";

/** Bộ nhãn chuẩn mà hệ thống dùng cho mọi repository. */
export const STANDARD_LABELS = [
  { name: "bug", title: "Lỗi (bug)" },
  { name: "enhancement", title: "Cải tiến (enhancement)" },
  { name: "task", title: "Công việc (task)" },
] as const;

export const DEFAULT_ISSUE_FILTERS: IssueFilters = {
  search: "",
  label: ALL,
  assignee: ALL,
};
