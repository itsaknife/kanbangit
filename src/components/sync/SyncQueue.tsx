"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button, EmptyState, ErrorMessage, Spinner } from "@/components/ui";
import { useRepoId, useRepository } from "@/hooks";
import { useSyncRefresh } from "@/hooks/useSyncRefresh";
import { useSyncStore, syncKey } from "@/stores/sync.store";
import { ROUTES } from "@/constants";
import { formatDateTime, getErrorMessage } from "@/utils";
import { SYNC_LABELS, syncStatusClass } from "@/utils/sync";
export function SyncQueue() {
  const repoId = useRepoId(),
    { repository, loading, error } = useRepository(repoId);
  const [page, setPage] = useState(1),
    [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const entry = useSyncStore((s) => s.queues[syncKey(repoId, page)]);
  const load = useSyncStore((s) => s.loadQueue),
    retry = useSyncStore((s) => s.retry);
  const busy = useSyncStore((s) => s.busy[repoId]);
  const reload = useCallback(() => {
    if (repository?.canManage && repository.providerType === "GITHUB") void load(repoId, page);
  }, [repository, load, repoId, page]);
  useSyncRefresh(repoId, reload);
  const runRetry = async (issueId?: string) => {
    setActionError(null);
    setNotice("");
    try {
      const count = await retry(repoId, issueId);
      setNotice(`Đã đưa ${count} issue vào hàng đợi.`);
      reload();
    } catch (e) {
      setActionError(getErrorMessage(e));
    }
  };
  if (error) return <ErrorMessage message={getErrorMessage(error)} />;
  if (loading) return <Spinner />;
  if (repository?.providerType === "KANBANGIT")
    return <EmptyState title="Project KanbanGit không sử dụng GitHub Sync" />;
  if (!repository?.canManage) return <EmptyState title="Chỉ Owner được xem Sync Queue" />;
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">GitHub Sync</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {entry?.data?.pagination.total ?? 0} issue đang chờ hoặc cần xử lý
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={reload} disabled={entry?.loading}>
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
          <Button size="sm" loading={busy} onClick={() => void runRetry()}>
            Retry các issue cần xử lý
          </Button>
        </div>
      </header>
      {actionError && <ErrorMessage message={actionError} />}
      {notice && (
        <p role="status" className="text-sm text-muted-foreground">
          {notice}
        </p>
      )}
      {entry?.error ? (
        <ErrorMessage message={entry.error} onRetry={reload} />
      ) : !entry?.data ? (
        <Spinner />
      ) : (
        <>
          {!entry.data.data.length ? (
            <EmptyState
              title="Không có issue chờ đồng bộ"
              description="Các issue đã được đồng bộ với GitHub."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Issue</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                    <th className="px-4 py-3 font-medium">Retry</th>
                    <th className="px-4 py-3 font-medium">Đồng bộ gần nhất</th>
                    <th className="px-4 py-3">
                      <span className="sr-only">Thao tác</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {entry.data.data.map((row) => (
                    <tr key={row.issueId}>
                      <td className="max-w-96 px-4 py-4">
                        <Link
                          href={ROUTES.issueDetail(repoId, row.issueId)}
                          className="block truncate hover:underline"
                        >
                          <span className="mr-2 text-xs text-muted-foreground">
                            {row.issueCode}
                          </span>
                          {row.title}
                        </Link>
                        {row.lastError && (
                          <p className="mt-1 text-xs leading-5 text-destructive">{row.lastError}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`whitespace-nowrap text-xs ${syncStatusClass(row.syncStatus)}`}
                        >
                          {SYNC_LABELS[row.syncStatus]}
                        </span>
                        {row.nextRetryAt && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Thử lại {formatDateTime(row.nextRetryAt)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs">{row.retryCount}/5</td>
                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        {row.lastSyncedAt ? formatDateTime(row.lastSyncedAt) : "—"}
                      </td>
                      <td className="px-4 py-4">
                        {row.syncStatus === "NEEDS_ATTENTION" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={busy}
                            onClick={() => void runRetry(row.issueId)}
                          >
                            Retry
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1 || entry.loading}
              onClick={() => setPage(page - 1)}
            >
              Trước
            </Button>
            <span>
              Trang {page}/{Math.max(1, entry.data.pagination.totalPages)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= entry.data.pagination.totalPages || entry.loading}
              onClick={() => setPage(page + 1)}
            >
              Sau
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
