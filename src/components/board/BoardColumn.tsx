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
        "flex min-h-[34rem] min-w-[18rem] flex-1 flex-col gap-3 rounded-xl border p-3 transition-colors",
        isOver
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
          : "border-border/80 bg-background/80",
      )}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${STATUS_STYLES[status].dot}`} />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {issues.length}
        </span>
      </header>

      {issues.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400">Chưa có issue</p>
      ) : (
        issues.map((issue) => <BoardCard key={issue.number} issue={issue} />)
      )}
    </section>
  );
}
