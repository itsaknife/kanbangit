import Link from "next/link";
import { Card } from "@/components/ui";
import { AssigneeAvatars, IssueLabels } from "@/components/issues";
import { ROUTES } from "@/constants";
import type { Issue } from "@/types";

interface BoardCardContentProps {
  issue: Issue;
  repoId: number;
}

/** Giao diện của một thẻ trên bảng (không có logic kéo-thả, dùng lại cho DragOverlay). */
export function BoardCardContent({ issue, repoId }: BoardCardContentProps) {
  return (
    <Card className="flex flex-col gap-2 p-3 shadow-sm">
      <div className="flex items-start gap-2">
        <span className="text-xs text-zinc-500">#{issue.number}</span>
        <Link
          href={ROUTES.issueDetail(repoId, issue.number)}
          className="text-sm font-medium hover:underline"
        >
          {issue.title}
        </Link>
      </div>
      <IssueLabels labels={issue.labels} />
      <AssigneeAvatars assignees={issue.assignees} />
    </Card>
  );
}
