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
      <Card className="group flex min-h-[9rem] shrink-0 cursor-grab flex-col gap-3 rounded-lg border-border/80 bg-background p-4 shadow-sm transition-colors hover:border-ring">
        <div className="flex h-6 items-center justify-between gap-3">
          <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
            {issue.issueCode}
          </span>
          <AssigneeAvatars assignees={issue.assignees} />
        </div>
        <Link
          href={ROUTES.issueDetail(repoId, issue.id)}
          title={issue.title}
          className="line-clamp-2 min-h-10 break-words text-left text-sm font-medium leading-5 hover:text-primary hover:underline"
        >
          {issue.title}
        </Link>
        <div className="mt-auto">
          <IssueTracker repoId={repoId} trackerId={issue.trackerId} />
        </div>
      </Card>
    </>
  );
}
