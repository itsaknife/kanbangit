"use client";

import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { ROUTES, STATUS_STYLES, STATUS_TITLES } from "@/constants";
import type { Issue } from "@/types";
import { cn, formatDate } from "@/utils";
import { AssigneeAvatars } from "./AssigneeAvatars";
import { IssueTracker } from "./IssueTracker";

interface IssueItemProps {
  issue: Issue;
  repoId: string;
}

export function IssueItem({ issue, repoId }: IssueItemProps) {
  return (
    <>
      <Card
        className={cn(
          "group flex items-center justify-between gap-5 p-4 transition-shadow hover:shadow-md",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <span className="pt-0.5 text-sm text-muted-foreground">{issue.issueCode}</span>
            <Link
              href={ROUTES.issueDetail(repoId, issue.number)}
              className="truncate text-left font-semibold transition-colors group-hover:text-primary hover:underline"
            >
              {issue.title}
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 pl-7">
            <IssueTracker repoId={repoId} trackerId={issue.trackerId} />
            <span className="text-xs text-muted-foreground">
              {issue.dueDate ? `Đến hạn vào ${formatDate(issue.dueDate)}` : "Chưa có ngày đến hạn"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn("border", STATUS_STYLES[issue.status].badge)}>
            {STATUS_TITLES[issue.status]}
          </Badge>
          <AssigneeAvatars assignees={issue.assignees} />
        </div>
      </Card>
    </>
  );
}
