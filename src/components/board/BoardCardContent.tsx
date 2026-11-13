"use client";

import Link from "next/link";
import { ROUTES } from "@/constants";
import { Card } from "@/components/ui";
import { AssigneeAvatars } from "@/components/issues";
import { IssueTracker } from "@/components/issues/IssueTracker";
import type { Issue } from "@/types";

interface BoardCardContentProps {
  issue: Issue;
  repoId: string;
}

/** Giao diện của một thẻ trên bảng (không có logic kéo-thả, dùng lại cho DragOverlay). */
export function BoardCardContent({ issue, repoId }: BoardCardContentProps) {
  return (
    <>
      <Card className="group flex cursor-grab flex-col gap-3 rounded-lg border-border/80 bg-background p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-ring hover:shadow-md">
        <div className="flex items-start gap-2">
          <span className="pt-0.5 text-xs text-muted-foreground">{issue.issueCode}</span>
          <Link
            href={ROUTES.issueDetail(repoId, issue.number)}
            className="text-left text-sm font-medium leading-5 hover:text-primary hover:underline"
          >
            {issue.title}
          </Link>
        </div>
        <div>
          <IssueTracker repoId={repoId} trackerId={issue.trackerId} />
        </div>
        <AssigneeAvatars assignees={issue.assignees} />
      </Card>
    </>
  );
}
