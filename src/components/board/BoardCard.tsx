"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useRepoId } from "@/hooks";
import type { Issue } from "@/types";
import { cn } from "@/utils";
import { BoardCardContent } from "./BoardCardContent";

/** Thẻ issue có thể kéo-thả giữa các cột. */
export function BoardCard({ issue }: { issue: Issue }) {
  const repoId = useRepoId();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.number,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn("cursor-grab touch-none", isDragging && "opacity-40")}
      {...listeners}
      {...attributes}
    >
      <BoardCardContent issue={issue} repoId={repoId} />
    </div>
  );
}
