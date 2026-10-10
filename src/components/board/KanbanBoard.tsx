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
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <IssueFilterBar
          value={filters}
          assignees={assignees}
          onChange={setFilters}
          onReset={resetFilters}
        />
        <Button onClick={() => setCreating(true)}>Tạo issue</Button>
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
