import type { IssueStatus } from "@/types";
export const BOARD_COLUMNS: ReadonlyArray<{ status: IssueStatus; title: string }> = [
  { status: "todo", title: "Cần làm" },
  { status: "in_progress", title: "Đang làm" },
  { status: "done", title: "Hoàn thành" },
  { status: "verified", title: "Đã xác minh" },
  { status: "closed", title: "Đã đóng" },
  { status: "reopen", title: "Mở lại" },
  { status: "rejected", title: "Từ chối" },
  { status: "paused", title: "Tạm dừng" },
  { status: "canceled", title: "Đã hủy" },
];
export const STATUS_TITLES: Record<IssueStatus, string> = {
  todo: "Cần làm",
  in_progress: "Đang làm",
  done: "Hoàn thành",
  verified: "Đã xác minh",
  closed: "Đã đóng",
  reopen: "Mở lại",
  rejected: "Từ chối",
  paused: "Tạm dừng",
  canceled: "Đã hủy",
};
