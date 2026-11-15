export type SyncStatus = "PENDING_SYNC" | "SYNCED" | "NEEDS_ATTENTION";
export interface SyncInfo {
  issueId: string;
  issueCode: string;
  syncStatus: SyncStatus;
  retryCount: number;
  lastError: string | null;
  lastSyncedAt: string | null;
  nextRetryAt: string | null;
  jobStatus: string | null;
  canRetry?: boolean;
}
export interface SyncQueueResult {
  data: (SyncInfo & { title: string })[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
