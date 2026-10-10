import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { ROUTES, STATUS_TITLES } from "@/constants";
import type { Issue } from "@/types";
import { formatDate } from "@/utils";
import { AssigneeAvatars } from "./AssigneeAvatars";
import { IssueLabels } from "./IssueLabels";

interface IssueItemProps {
  issue: Issue;
  repoId: number;
}

export function IssueItem({ issue, repoId }: IssueItemProps) {
  return (
    <Card className="flex items-center justify-between gap-4 p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">#{issue.number}</span>
          <Link
            href={ROUTES.issueDetail(repoId, issue.number)}
            className="truncate font-medium hover:underline"
          >
            {issue.title}
          </Link>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <IssueLabels labels={issue.labels} />
          <span className="text-xs text-zinc-500">Cập nhật {formatDate(issue.updatedAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge>{STATUS_TITLES[issue.status]}</Badge>
        <AssigneeAvatars assignees={issue.assignees} />
      </div>
    </Card>
  );
}
