"use client";
import { useCallback, useState } from "react";
import { AlertCircle, Check, Clock3, RefreshCw } from "lucide-react";
import {
  Button,
  ErrorMessage,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
} from "@/components/ui";
import { useSyncStore, syncKey } from "@/stores/sync.store";
import { useSyncRefresh } from "@/hooks/useSyncRefresh";
import type { SyncStatus } from "@/types/sync.types";
import { formatDateTime, getErrorMessage } from "@/utils";
import { SYNC_LABELS, syncStatusClass } from "@/utils/sync";
export function IssueSync({
  repoId,
  issueId,
  status,
}: {
  repoId: string;
  issueId: string;
  status: SyncStatus;
}) {
  const entry = useSyncStore((s) => s.details[syncKey(repoId, issueId)]);
  const load = useSyncStore((s) => s.loadInfo),
    retry = useSyncStore((s) => s.retry);
  const busy = useSyncStore((s) => s.busy[repoId]);
  const reload = useCallback(() => {
    void load(repoId, issueId);
  }, [load, repoId, issueId]);
  useSyncRefresh(repoId, reload);
  const [actionError, setActionError] = useState<string | null>(null);
  const data = entry?.data;
  const current = data?.syncStatus ?? status;
  const Icon = current === "SYNCED" ? Check : current === "NEEDS_ATTENTION" ? AlertCircle : Clock3;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={`text-xs ${syncStatusClass(current)}`}>
          <Icon className="h-3.5 w-3.5" />
          {SYNC_LABELS[current]}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">GitHub Sync</h2>
          <Button variant="ghost" size="sm" aria-label="Làm mới đồng bộ" onClick={reload}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
        {entry?.error ? (
          <ErrorMessage message={entry.error} onRetry={reload} />
        ) : !data ? (
          <Spinner />
        ) : (
          <>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Trạng thái</dt>
                <dd className={syncStatusClass(current)}>{SYNC_LABELS[current]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Đồng bộ gần nhất</dt>
                <dd>{data.lastSyncedAt ? formatDateTime(data.lastSyncedAt) : "Chưa đồng bộ"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Số lần retry</dt>
                <dd>{data.retryCount}/5</dd>
              </div>
              {data.nextRetryAt && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Thử lại lúc</dt>
                  <dd>{formatDateTime(data.nextRetryAt)}</dd>
                </div>
              )}
            </dl>
            {data.lastError && (
              <p className="text-xs leading-5 text-destructive">{data.lastError}</p>
            )}
            {data.canRetry && current === "NEEDS_ATTENTION" && (
              <Button
                variant="secondary"
                size="sm"
                loading={busy}
                onClick={async () => {
                  setActionError(null);
                  try {
                    await retry(repoId, issueId);
                    reload();
                  } catch (e) {
                    setActionError(getErrorMessage(e));
                  }
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry đồng bộ
              </Button>
            )}
          </>
        )}
        {actionError && (
          <p role="alert" className="text-xs text-destructive">
            {actionError}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
