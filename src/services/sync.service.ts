import { http } from "./http";
import type { SyncInfo, SyncQueueResult } from "@/types/sync.types";
const root = (repoId: string) => `/repositories/${repoId}`;
export const syncService = {
  info: (repoId: string, issueId: string) =>
    http.get<SyncInfo>(`${root(repoId)}/issues/${issueId}/sync`),
  queue: (repoId: string, page = 1) =>
    http.get<SyncQueueResult>(`${root(repoId)}/sync/queue`, { page, limit: 20 }),
  retry: (repoId: string, issueId?: string) =>
    http.post<{ queued: number }>(
      issueId ? `${root(repoId)}/issues/${issueId}/sync/retry` : `${root(repoId)}/sync/retry`,
    ),
};
