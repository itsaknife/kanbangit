import type { IssueStatus } from "@/types";

/** Các cột trên bảng Kanban, theo đúng thứ tự hiển thị. */
export const BOARD_COLUMNS: ReadonlyArray<{ status: IssueStatus; title: string }> = [
  { status: "todo", title: "Cần làm" },
  { status: "in_progress", title: "Đang làm" },
  { status: "done", title: "Hoàn thành" },
];

export const STATUS_TITLES: Record<IssueStatus, string> = {
  todo: "Cần làm",
  in_progress: "Đang làm",
  done: "Hoàn thành",
};
