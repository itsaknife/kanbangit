"use client";

import { useDroppable } from "@dnd-kit/core";
import { STATUS_STYLES } from "@/constants";
import type { Issue, IssueStatus } from "@/types";
import { cn } from "@/utils";
import { BoardCard } from "./BoardCard";

interface BoardColumnProps {
  status: IssueStatus;
  title: string;
  issues: Issue[];
}

/** Một cột của bảng Kanban, là vùng có thể thả thẻ vào. Id vùng thả chính là trạng thái. */
export function BoardColumn({ status, title, issues }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex h-full w-[21rem] min-w-[21rem] shrink-0 flex-col overflow-hidden rounded-lg border transition-colors",
        isOver
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
          : "border-border/80 bg-background/80",
      )}
    >
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${STATUS_STYLES[status].dot}`} />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {issues.length}
        </span>
      </header>

      <div className="kanban-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        {issues.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">Chưa có issue</p>
        ) : (
          issues.map((issue) => <BoardCard key={issue.id} issue={issue} />)
        )}
      </div>
    </section>
  );
}
