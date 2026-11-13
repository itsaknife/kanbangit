"use client";
import Link from "next/link";
import { useState } from "react";
import { Button, ErrorMessage, Modal, Select, Spinner } from "@/components/ui";
import { ROUTES, SOCKET_EVENTS, STATUS_TITLES } from "@/constants";
import { useAsync } from "@/hooks/useAsync";
import { useRepository } from "@/hooks/useRepository";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { useIssuesStore } from "@/stores/issues.store";
import type { Issue, IssueEventPayload } from "@/types";
import { getErrorMessage } from "@/utils";
import { formatEstimateHours } from "@/utils/formatEstimateHours";
import { CreateIssueModal } from "./CreateIssueModal";

export function IssueHierarchy({ repoId, issue }: { repoId: string; issue: Issue }) {
  const loadSubIssues = useIssuesStore((s) => s.loadSubIssues);
  const setParent = useIssuesStore((s) => s.setParent);
  const cascadeClose = useIssuesStore((s) => s.cascadeClose);
  const loadIssue = useIssuesStore((s) => s.loadIssue);
  const createIssue = useIssuesStore((s) => s.createIssue);
  const fetchIssues = useIssuesStore((s) => s.fetchIssues);
  const [creatingChild, setCreatingChild] = useState(false);
  const issues = useIssuesStore((s) => s.byRepository[repoId]?.issues);
  const { repository } = useRepository(repoId);
  const {
    data: children,
    loading,
    error: loadError,
    reload,
  } = useAsync(
    () => loadSubIssues(repoId, issue.id),
    [repoId, issue.id, issue.updatedAt, issue.subIssueEstimateMinutes],
  );
  const [childId, setChildId] = useState("");
  const refreshChildren = ({ repoId: id }: IssueEventPayload) => {
    if (id === repoId) reload();
  };
  useSocketEvent<IssueEventPayload>(SOCKET_EVENTS.issueUpdated, refreshChildren);
  useSocketEvent<IssueEventPayload>(SOCKET_EVENTS.issueCreated, refreshChildren);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      await loadIssue(repoId, issue.id);
      reload();
      setChildId("");
      setConfirmClose(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const candidates = (issues ?? []).filter(
    (item) => item.id !== issue.id && item.parentId !== issue.id,
  );
  const parent = issue.parent ?? issues?.find((item) => item.id === issue.parentId);
  return (
    <section className="space-y-4 rounded-lg border p-5" aria-label="Quan hệ issue">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Issue con</h2>
        <Button variant="secondary" size="sm" onClick={() => setCreatingChild(true)}>
          Tạo issue con
        </Button>
      </div>
      <CreateIssueModal
        open={creatingChild}
        parentId={issue.id}
        onClose={() => setCreatingChild(false)}
        onCreate={async (payload) => {
          const child = await createIssue(repoId, payload);
          void loadIssue(repoId, issue.id).catch((err) => setError(getErrorMessage(err)));
          void fetchIssues(repoId);
          reload();
          return child;
        }}
      />
      <p className="text-sm text-muted-foreground">
        Ước lượng riêng: {formatEstimateHours(issue.estimateMinutes)} · Issue con:{" "}
        {formatEstimateHours(issue.subIssueEstimateMinutes)} · Tổng:{" "}
        {formatEstimateHours(issue.combinedEstimateMinutes)}
      </p>
      {issue.parentId && (
        <Link className="block text-sm underline" href={ROUTES.issueDetail(repoId, issue.parentId)}>
          Issue cha: {parent ? parent.issueCode + " · " + parent.title : issue.parentId}
        </Link>
      )}
      {loading && <Spinner />}
      {loadError ? <ErrorMessage message={getErrorMessage(loadError)} onRetry={reload} /> : null}
      {!loading && !loadError && !children?.length && (
        <p className="text-sm text-muted-foreground">Chưa có issue con.</p>
      )}
      <ul className="divide-y">
        {children?.map((child) => (
          <li
            key={child.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
          >
            <Link
              className="min-w-0 flex-1 hover:underline"
              href={ROUTES.issueDetail(repoId, child.id)}
            >
              {child.issueCode} · {child.title}
            </Link>
            <span>{STATUS_TITLES[child.status]}</span>
            <span>{formatEstimateHours(child.combinedEstimateMinutes)}</span>
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => void run(() => setParent(repoId, child.id, null))}
            >
              Tách issue con
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <Select
            label="Thêm issue hiện có"
            value={childId}
            options={candidates.map((child) => ({
              value: child.id,
              label: child.issueCode + " · " + child.title,
            }))}
            onChange={setChildId}
            disabled={busy}
          />
        </div>
        <Button
          disabled={!childId || busy}
          onClick={() => void run(() => setParent(repoId, childId, issue.id))}
        >
          Thêm issue con
        </Button>
        {repository?.canManage && (
          <Button variant="secondary" disabled={busy} onClick={() => setConfirmClose(true)}>
            Đóng cả cây issue
          </Button>
        )}
      </div>
      {error && <ErrorMessage message={error} />}
      <Modal
        open={confirmClose}
        title="Đóng issue và tất cả issue con?"
        onClose={() => {
          if (!busy) setConfirmClose(false);
        }}
      >
        <p className="mb-5 text-sm">
          Thao tác này đóng issue hiện tại và toàn bộ issue con bên dưới.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" disabled={busy} onClick={() => setConfirmClose(false)}>
            Hủy
          </Button>
          <Button
            loading={busy}
            disabled={!repository?.canManage}
            onClick={() => void run(() => cascadeClose(repoId, issue.id))}
          >
            Đóng cả cây issue
          </Button>
        </div>
        {error && <ErrorMessage message={error} />}
      </Modal>
    </section>
  );
}
