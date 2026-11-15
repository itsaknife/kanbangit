import type { SyncStatus } from "@/types/sync.types";
export const SYNC_LABELS: Record<SyncStatus, string> = {
  SYNCED: "Đã đồng bộ GitHub",
  PENDING_SYNC: "Chờ đồng bộ GitHub",
  NEEDS_ATTENTION: "Cần xử lý đồng bộ",
};
export const syncStatusClass = (status: SyncStatus) =>
  status === "NEEDS_ATTENTION"
    ? "text-destructive"
    : status === "SYNCED"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-muted-foreground";
