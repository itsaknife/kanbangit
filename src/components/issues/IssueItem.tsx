"use client";

import Link from "next/link";
import { Badge } from "@/components/ui";
import { CalendarDays } from "lucide-react";
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
    <Link
      href={ROUTES.issueDetail(repoId, issue.id)}
      className="group flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-3 transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:flex-nowrap sm:px-4"
    >
      <span
        className="w-20 shrink-0 truncate font-mono text-xs text-muted-foreground"
        title={issue.issueCode}
      >
        {issue.issueCode}
      </span>
      <div className="min-w-0 flex-1 basis-1/2 sm:basis-auto">
        <span
          className="block truncate text-sm font-medium group-hover:text-primary"
          title={issue.title}
        >
          {issue.title}
        </span>
      </div>
      <div className="flex basis-full flex-wrap items-center gap-3 sm:basis-auto sm:shrink-0">
        <span className="inline-flex max-w-36">
          <IssueTracker repoId={repoId} trackerId={issue.trackerId} />
        </span>
        {issue.endDate && (
          <span
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground"
            title="Ngày kết thúc"
          >
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            {formatDate(issue.endDate)}
          </span>
        )}
        <Badge className={cn("border", STATUS_STYLES[issue.status].badge)}>
          {STATUS_TITLES[issue.status]}
        </Badge>
        <span className="flex w-14 justify-end">
          <AssigneeAvatars assignees={issue.assignees} />
        </span>
      </div>
    </Link>
  );
}
