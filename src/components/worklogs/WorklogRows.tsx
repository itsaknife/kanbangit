"use client";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar, Button } from "@/components/ui";
import type { Worklog } from "@/types/collaboration.types";
import { formatDateTime } from "@/utils";
import { formatDuration } from "@/utils/worklog";
export function WorklogRows({
  rows,
  repoId,
  showIssue = false,
  busy = false,
  onEdit,
  onDelete,
}: {
  rows: Worklog[];
  repoId: string;
  showIssue?: boolean;
  busy?: boolean;
  onEdit?: (row: Worklog) => void;
  onDelete?: (row: Worklog) => void;
}) {
  if (!rows.length)
    return (
      <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
        Chưa có worklog trong khoảng thời gian này.
      </div>
    );
  return (
    <div className="divide-y overflow-hidden rounded-lg border">
      {rows.map((row) => (
        <article key={row.id} className="bg-card px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              {showIssue && (
                <Link
                  className="block text-sm font-medium hover:underline"
                  href={`/repositories/${repoId}/issues/${row.issueId}`}
                >
                  {row.issue.issueCode} · {row.issue.title}
                </Link>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Avatar
                  src={row.member.avatarUrl ?? ""}
                  alt={row.member.name}
                  size={24}
                  unoptimized
                />
                <span>{row.member.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(row.startAt)} → {formatDateTime(row.endAt)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className="mr-2 rounded-md bg-muted px-2 py-1 text-xs font-medium">
                {formatDuration(row.selectedMinutes)}
              </span>
              {row.canEdit && onEdit && (
                <Button
                  aria-label="Sửa worklog"
                  title="Sửa worklog"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => onEdit(row)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              {row.canDelete && onDelete && (
                <Button
                  aria-label="Xóa worklog"
                  title="Xóa worklog"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  disabled={busy}
                  onClick={() => onDelete(row)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
          {row.description && (
            <p className="mt-3 whitespace-pre-wrap break-words text-sm text-muted-foreground">
              {row.description}
            </p>
          )}
          {row.selectedMinutes !== row.durationMinutes && (
            <p className="mt-2 text-xs text-muted-foreground">
              Trong khoảng đã chọn · Toàn bộ worklog: {formatDuration(row.durationMinutes)}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
