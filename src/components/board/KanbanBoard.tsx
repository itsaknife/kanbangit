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
import { useState } from "react";
import { createPortal } from "react-dom";
import { useRepositoryToolbar } from "@/components/layout/RepositoryWorkspace";
import { IssueFilterBar, CreateIssueModal } from "@/components/issues";
import { CreateIssueButton } from "@/components/issues/CreateIssueButton";
import { ErrorMessage, Spinner } from "@/components/ui";
import { BOARD_COLUMNS } from "@/constants";
import { useBoard, useRepoId } from "@/hooks";
import type { Issue } from "@/types";
import { getErrorMessage } from "@/utils";
import { BoardCardContent } from "./BoardCardContent";
import { BoardColumn } from "./BoardColumn";

export function KanbanBoard() {
  const toolbar = useRepositoryToolbar();
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
    moveIssue,
    createIssue,
    actionError,
    isMoving,
  } = useBoard();
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [creating, setCreating] = useState(false);

  // Chỉ bắt đầu kéo khi chuột di chuyển một đoạn, để vẫn bấm được vào tiêu đề thẻ
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const issueId = String(event.active.id);
    const issue = BOARD_COLUMNS.flatMap((column) => columns[column.status]).find(
      (item) => item.id === issueId,
    );
    setActiveIssue(issue ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveIssue(null);
    const { active, over } = event;
    if (!over) return; // thả ra ngoài các cột
    const column = BOARD_COLUMNS.find((item) => item.status === over.id);
    if (column) void moveIssue(String(active.id), column.status);
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
    <section className="flex h-[calc(100dvh-13rem)] min-h-[36rem] min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-border/70 bg-muted/35 p-3 shadow-sm dark:bg-zinc-900/60 lg:p-4">
      {toolbar &&
        createPortal(
          <>
            <IssueFilterBar
              value={filters}
              assignees={assignees}
              onChange={setFilters}
              onReset={resetFilters}
            />
            <CreateIssueButton onClick={() => setCreating(true)} />
          </>,
          toolbar,
        )}

      <CreateIssueModal open={creating} onClose={() => setCreating(false)} onCreate={createIssue} />
      {isMoving && (
        <p role="status" className="text-sm text-muted-foreground">
          Đang lưu trạng thái…
        </p>
      )}
      {actionError && <ErrorMessage message={actionError} />}

      {/* id cố định để tránh lệch id giữa server và client khi hydrate */}
      <DndContext
        id="kanban-board"
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveIssue(null)}
      >
        <div
          className="kanban-scrollbar flex min-h-0 flex-1 items-stretch gap-4 overflow-x-auto overflow-y-hidden pb-2"
          aria-label="Các cột Kanban"
        >
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
    </section>
  );
}
