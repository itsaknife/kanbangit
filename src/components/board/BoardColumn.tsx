"use client";

import { useDroppable } from "@dnd-kit/core";
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
        "flex min-h-64 flex-1 flex-col gap-3 rounded-lg border p-3 transition-colors",
        isOver
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
          : "border-zinc-200 bg-zinc-100/60 dark:border-zinc-800 dark:bg-zinc-900/60",
      )}
    >
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-zinc-500">{issues.length}</span>
      </header>

      {issues.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400">Chưa có issue</p>
      ) : (
        issues.map((issue) => <BoardCard key={issue.number} issue={issue} />)
      )}
    </section>
  );
}
