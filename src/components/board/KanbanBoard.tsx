"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateIssueModal, IssueFilterBar } from "@/components/issues";
import { Button, ErrorMessage, Spinner } from "@/components/ui";
import { BOARD_COLUMNS } from "@/constants";
import { useBoard, useRepoId } from "@/hooks";
import type { Issue, IssueStatus } from "@/types";
import { getErrorMessage } from "@/utils";
import { BoardCardContent } from "./BoardCardContent";
import { BoardColumn } from "./BoardColumn";

export function KanbanBoard() {
  const repoId = useRepoId();
  const {
    columns,
    assignees,
    filters,
    setFilters,
    resetFilters,
    loading,
    error,
    reload,
    createIssue,
    moveIssue,
    actionError,
  } = useBoard();
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [creating, setCreating] = useState(false);

  // Chỉ bắt đầu kéo khi chuột di chuyển một đoạn, để vẫn bấm được vào tiêu đề thẻ
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const issueNumber = Number(event.active.id);
    const issue = BOARD_COLUMNS.flatMap((column) => columns[column.status]).find(
      (item) => item.number === issueNumber,
    );
    setActiveIssue(issue ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveIssue(null);
    const { active, over } = event;
    if (!over) return; // thả ra ngoài các cột
    void moveIssue(Number(active.id), over.id as IssueStatus);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }
  if (error) return <ErrorMessage message={getErrorMessage(error)} onRetry={reload} />;

  return (
    <section className="flex min-w-0 min-h-[calc(100vh-13rem)] flex-col gap-4 rounded-2xl border border-border/70 bg-muted/35 p-4 shadow-sm dark:bg-zinc-900/60 lg:p-5">
      <div className="flex items-center justify-end gap-2 px-1">
        <IssueFilterBar
          value={filters}
          assignees={assignees}
          onChange={setFilters}
          onReset={resetFilters}
        />
        <Button
          onClick={() => setCreating(true)}
          className="h-10 w-10 rounded-xl p-0"
          title="Tạo issue mới"
          aria-label="Tạo issue mới"
        >
          <Plus className="h-8 w-8" strokeWidth={2.5} />
        </Button>
      </div>

      {actionError && <ErrorMessage message={actionError} />}

      {/* id cố định để tránh lệch id giữa server và client khi hydrate */}
      <DndContext
        id="kanban-board"
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveIssue(null)}
      >
        <div className="flex gap-4 overflow-x-auto pb-2">
          {BOARD_COLUMNS.map((column) => (
            <BoardColumn
              key={column.status}
              status={column.status}
              title={column.title}
              issues={columns[column.status]}
            />
          ))}
        </div>

        <DragOverlay>
          {activeIssue ? <BoardCardContent issue={activeIssue} repoId={repoId} /> : null}
        </DragOverlay>
      </DndContext>

      <CreateIssueModal open={creating} onClose={() => setCreating(false)} onCreate={createIssue} />
    </section>
  );
}
