"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { AssigneeAvatars, IssueEditDialog, IssueLabels } from "@/components/issues";
import type { Issue } from "@/types";

interface BoardCardContentProps {
  issue: Issue;
  repoId: number;
}

/** Giao diện của một thẻ trên bảng (không có logic kéo-thả, dùng lại cho DragOverlay). */
export function BoardCardContent({ issue, repoId }: BoardCardContentProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card className="group flex cursor-grab flex-col gap-3 rounded-lg border-border/80 bg-background p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-ring hover:shadow-md">
        <div className="flex items-start gap-2">
          <span className="pt-0.5 text-xs text-muted-foreground">#{issue.number}</span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-left text-sm font-medium leading-5 hover:text-primary hover:underline"
          >
            {issue.title}
          </button>
        </div>
        <IssueLabels labels={issue.labels} />
        <AssigneeAvatars assignees={issue.assignees} />
      </Card>
      {open && (
        <IssueEditDialog issue={issue} repoId={repoId} open onClose={() => setOpen(false)} />
      )}
    </>
  );
}
