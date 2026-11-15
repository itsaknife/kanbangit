"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClassName, EmptyState, ErrorMessage, Select, Spinner } from "@/components/ui";
import { BOARD_COLUMNS, ROUTES } from "@/constants";
import { useIssue, useIssueId, useRepoId } from "@/hooks";
import { formatDateTime, getErrorMessage } from "@/utils";
import { IssueHierarchy } from "./IssueHierarchy";
import { IssueForm } from "./IssueForm";
import { IssueWorklogs } from "@/components/worklogs/IssueWorklogs";
import { IssueComments } from "@/components/comments/IssueComments";
import { IssueSync } from "@/components/sync/IssueSync";

const STATUS_OPTIONS = BOARD_COLUMNS.map((column) => ({
  value: column.status,
  label: column.title,
}));

export function IssueDetail() {
  const repoId = useRepoId();
  const issueId = useIssueId();
  const { issue, loading, error, reload, updateIssue, changeStatus } = useIssue(repoId, issueId);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  if (error && !issue) return <ErrorMessage message={getErrorMessage(error)} onRetry={reload} />;
  if (!issue) return <EmptyState title="Không tìm thấy issue" />;

  return (
    <section className="flex min-h-[calc(100vh-14rem)] w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={ROUTES.issues(repoId)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← Danh sách issue
          </Link>
          <span aria-hidden="true" className="h-4 w-px bg-border" />
          <h1 className="text-sm font-medium">
            {issue.issueCode}
            {issue.number !== null && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                GitHub #{issue.number}
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <IssueSync key={issue.id} repoId={repoId} issueId={issue.id} status={issue.syncStatus} />
          {issue.htmlUrl && (
            <a
              href={issue.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClassName({ variant: "ghost", size: "sm" })}
            >
              Mở trên GitHub ↗
            </a>
          )}
        </div>
      </div>
      {error ? <ErrorMessage message={getErrorMessage(error)} onRetry={reload} /> : null}
      {saved && (
        <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
          Đã lưu thay đổi.
        </p>
      )}
      <IssueForm
        initialAssignee={issue.assignees[0]}
        issueId={issue.id}
        key={`${issue.id}-${formVersion}`}
        layout="page"
        submitLabel="Lưu thay đổi"
        initialValues={{
          title: issue.title,
          body: issue.body ?? "",
          trackerId: issue.trackerId,
          assigneeId: issue.assigneeId ?? "",
          startDate: issue.startDate ?? "",
          endDate: issue.endDate ?? "",
          estimateHours: issue.estimateMinutes === null ? "" : String(issue.estimateMinutes / 60),
          parentId: issue.parentId ?? "",
          status: issue.status,
        }}
        properties={
          <div className="space-y-1.5">
            <Select
              label="Trạng thái"
              appearance="subtle"
              options={STATUS_OPTIONS}
              value={issue.status}
              disabled={statusSaving}
              onChange={async (value) => {
                setStatusSaving(true);
                setStatusError(null);
                setSaved(false);
                try {
                  const status = BOARD_COLUMNS.find((column) => column.status === value)?.status;
                  if (status) await changeStatus(status);
                } catch (err) {
                  setStatusError(getErrorMessage(err));
                } finally {
                  setStatusSaving(false);
                }
              }}
            />
            {statusError && (
              <p role="alert" className="text-xs text-destructive">
                {statusError}
              </p>
            )}
          </div>
        }
        onCancel={() => {
          setFormVersion((v) => v + 1);
          setSaved(false);
        }}
        onSubmit={async (payload) => {
          setSaved(false);
          await updateIssue(payload);
          setSaved(true);
        }}
      />
      <IssueHierarchy key={issue.id} repoId={repoId} issue={issue} />
      <IssueWorklogs
        key={`time-${issue.id}`}
        repoId={repoId}
        issueId={issue.id}
        version={`${issue.updatedAt}-${issue.combinedEstimateMinutes}`}
      />
      <IssueComments key={`comments-${issue.id}`} repoId={repoId} issueId={issue.id} />
      <footer className="mt-auto border-t pt-4 text-xs leading-6 text-muted-foreground">
        Tạo bởi {issue.author?.login ?? "không rõ"} ·{" "}
        {issue.createdAt ? formatDateTime(issue.createdAt) : "—"}
        <br />
        Cập nhật {issue.updatedAt ? formatDateTime(issue.updatedAt) : "—"}
      </footer>
    </section>
  );
}
