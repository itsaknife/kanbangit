import { Avatar } from "@/components/ui";
import type { UserSummary } from "@/types";

export function AssigneeAvatars({ assignees }: { assignees: UserSummary[] }) {
  if (assignees.length === 0) {
    return <span className="text-xs text-zinc-500">Chưa giao</span>;
  }

  return (
    <div className="flex -space-x-1.5">
      {assignees.map((assignee) => (
        <span key={assignee.login} title={assignee.login}>
          <Avatar
            src={assignee.avatarUrl}
            alt={assignee.login}
            size={22}
            className="ring-2 ring-white dark:ring-zinc-900"
          />
        </span>
      ))}
    </div>
  );
}
