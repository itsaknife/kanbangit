"use client";

import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import {
  Button,
  buttonClassName,
  Card,
  EmptyState,
  ErrorMessage,
  Select,
  Spinner,
} from "@/components/ui";
import { BOARD_COLUMNS, ROUTES } from "@/constants";
import { useIssue, useIssueNumber, useRepoId } from "@/hooks";
import type { IssueStatus } from "@/types";
import { formatDateTime, getErrorMessage, getStandardLabel } from "@/utils";
import { AssigneeAvatars } from "./AssigneeAvatars";
import { IssueForm } from "./IssueForm";
import { IssueLabels } from "./IssueLabels";

const STATUS_OPTIONS = BOARD_COLUMNS.map((column) => ({
  value: column.status,
  label: column.title,
}));

export function IssueDetail() {
  const repoId = useRepoId();
  const issueNumber = useIssueNumber();
  const { issue, loading, error, updateIssue, changeStatus } = useIssue(repoId, issueNumber);
  const [editing, setEditing] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }
  if (error) return <ErrorMessage message={getErrorMessage(error)} />;
  if (!issue) return <EmptyState title="Không tìm thấy issue" />;

  const handleStatusChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    setStatusError(null);
    try {
      await changeStatus(event.target.value as IssueStatus);
    } catch (err) {
      setStatusError(getErrorMessage(err));
    }
  };

  if (editing) {
    return (
      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Chỉnh sửa issue #{issue.number}</h2>
        <IssueForm
          submitLabel="Lưu thay đổi"
          initialValues={{
            title: issue.title,
            body: issue.body ?? "",
            label: getStandardLabel(issue),
          }}
          onCancel={() => setEditing(false)}
          onSubmit={async (payload) => {
            await updateIssue(payload);
            setEditing(false);
          }}
        />
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <Link href={ROUTES.issues(repoId)} className="text-sm text-blue-600 hover:underline">
        ← Danh sách issue
      </Link>

      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold">
          <span className="text-zinc-500">#{issue.number}</span> {issue.title}
        </h2>
        <div className="flex shrink-0 gap-2">
          <a
            href={issue.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClassName({ variant: "secondary", size: "sm" })}
          >
            Mở trên GitHub
          </a>
          <Button size="sm" onClick={() => setEditing(true)}>
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          aria-label="Trạng thái"
          options={STATUS_OPTIONS}
          value={issue.status}
          onChange={handleStatusChange}
        />
        <IssueLabels labels={issue.labels} />
        <AssigneeAvatars assignees={issue.assignees} />
      </div>
      {statusError && <ErrorMessage message={statusError} />}

      <p className="whitespace-pre-wrap text-sm leading-6">
        {issue.body || "Issue này chưa có mô tả."}
      </p>

      <p className="text-xs text-zinc-500">
        Tạo bởi {issue.author?.login ?? "không rõ"} lúc {formatDateTime(issue.createdAt)} · Cập nhật
        lúc {formatDateTime(issue.updatedAt)}
      </p>
    </Card>
  );
}
