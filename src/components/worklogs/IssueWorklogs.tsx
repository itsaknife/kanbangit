"use client";
import { useEffect, useState } from "react";
import { Clock3, Plus, TriangleAlert } from "lucide-react";
import { Button, ErrorMessage, Modal, Spinner } from "@/components/ui";
import { useMembersStore } from "@/stores/members.store";
import { useWorklogsStore, worklogKey } from "@/stores/worklogs.store";
import { formatDuration } from "@/utils/worklog";
import { getErrorMessage } from "@/utils";
import type { Worklog } from "@/types/collaboration.types";
import { WorklogForm } from "./WorklogForm";
import { WorklogRows } from "./WorklogRows";
import { useCollaborationRefresh } from "@/hooks/useCollaborationRefresh";
export function IssueWorklogs({
  repoId,
  issueId,
  version,
}: {
  repoId: string;
  issueId: string;
  version: string;
}) {
  const entry = useWorklogsStore((s) => s.entries[worklogKey(repoId, { issueId })]);
  const load = useWorklogsStore((s) => s.load),
    save = useWorklogsStore((s) => s.save),
    remove = useWorklogsStore((s) => s.remove),
    busy = useWorklogsStore((s) => s.busy);
  const members = useMembersStore((s) => s.byRepository[repoId]?.members);
  const loadMembers = useMembersStore((s) => s.fetch);
  const [editing, setEditing] = useState<Worklog | "new" | null>(null),
    [deleting, setDeleting] = useState<Worklog | null>(null),
    [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void load(repoId, { issueId });
  }, [repoId, issueId, version, load]);
  useEffect(() => {
    void loadMembers(repoId);
  }, [repoId, loadMembers]);
  useCollaborationRefresh(repoId, () => {
    void load(repoId, { issueId });
  });
  const summary = entry?.summary;
  return (
    <section className="space-y-5 border-t pt-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Thời gian thực hiện</h2>
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={!entry?.data || busy}
          onClick={() => setEditing("new")}
        >
          <Plus className="h-4 w-4" />
          Ghi thời gian
        </Button>
      </div>
      {entry?.error && (
        <ErrorMessage message={entry.error} onRetry={() => load(repoId, { issueId })} />
      )}
      {!entry?.data && entry?.loading && <Spinner />}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="py-2">
            <p className="text-xs text-muted-foreground">Worklog trực tiếp / Estimate</p>
            <p className="mt-2 text-sm font-medium">
              {formatDuration(summary.directMinutes)} /{" "}
              {summary.estimateMinutes === null
                ? "Chưa ước lượng"
                : formatDuration(summary.estimateMinutes)}
            </p>
          </div>
          <div className="py-2">
            <p className="text-xs text-muted-foreground">Cả cây issue / Combined Estimate</p>
            <p className="mt-2 text-sm font-medium">
              {formatDuration(summary.combinedMinutes)} /{" "}
              {formatDuration(summary.combinedEstimateMinutes)}
            </p>
          </div>
        </div>
      )}
      {summary && (summary.directOverEstimate || summary.combinedOverEstimate) && (
        <p
          role="status"
          className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400"
        >
          <TriangleAlert className="h-4 w-4 shrink-0" />
          {[
            summary.directOverEstimate ? "Thời gian trực tiếp vượt estimate." : "",
            summary.combinedOverEstimate ? "Tổng thời gian cây issue vượt combined estimate." : "",
          ]
            .filter(Boolean)
            .join(" ")}
        </p>
      )}
      {entry?.data &&
        (entry.data.canView ? (
          <WorklogRows
            rows={entry.data.data}
            repoId={repoId}
            busy={busy}
            onEdit={setEditing}
            onDelete={(row) => {
              setError(null);
              setDeleting(row);
            }}
          />
        ) : (
          <p className="py-3 text-sm text-muted-foreground">
            Bạn có thể xem các worklog của issue này sau khi đã ghi nhận thời gian tham gia.
          </p>
        ))}
      {editing && entry?.data && (
        <Modal
          open
          title={editing === "new" ? "Ghi thời gian" : "Sửa worklog"}
          onClose={() => {
            if (!busy) setEditing(null);
          }}
        >
          <WorklogForm
            worklog={editing === "new" ? undefined : editing}
            members={members ?? []}
            canManage={entry.data.canManage}
            currentMemberId={entry.data.currentMemberId}
            busy={busy}
            onCancel={() => setEditing(null)}
            onSave={async (body) => {
              await save(repoId, issueId, body, editing === "new" ? undefined : editing.id);
              setEditing(null);
              await load(repoId, { issueId });
            }}
          />
        </Modal>
      )}
      {deleting && (
        <Modal
          open
          title="Xóa worklog"
          onClose={() => {
            if (!busy) setDeleting(null);
          }}
        >
          <div className="space-y-4">
            <p className="text-sm">
              Xóa worklog {formatDuration(deleting.durationMinutes)} của {deleting.member.name}?
              Thao tác này không thể hoàn tác.
            </p>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" disabled={busy} onClick={() => setDeleting(null)}>
                Hủy
              </Button>
              <Button
                variant="danger"
                loading={busy}
                onClick={async () => {
                  try {
                    await remove(repoId, deleting.id);
                    setDeleting(null);
                    await load(repoId, { issueId });
                  } catch (e) {
                    setError(getErrorMessage(e));
                  }
                }}
              >
                Xóa worklog
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
