"use client";

import { Modal } from "@/components/ui";
import { useRepoId, useRepository } from "@/hooks";
import { Rocket } from "lucide-react";
import type { CreateIssuePayload } from "@/types";
import { IssueForm } from "./IssueForm";

interface CreateIssueModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateIssuePayload) => Promise<unknown>;
  parentId?: string;
}

/** Hộp thoại tạo issue mới (có AI kiểm tra trùng lặp). Dùng ở cả Kanban và danh sách issue. */
export function CreateIssueModal({ open, onClose, onCreate, parentId }: CreateIssueModalProps) {
  const repoId = useRepoId();
  const { repository } = useRepository(repoId);
  return (
    <Modal
      open={open}
      title={
        <span className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
            <Rocket className="h-3.5 w-3.5" />
            {repository?.fullName ?? "Repository"}
          </span>
          <span aria-hidden="true" className="text-muted-foreground">
            ›
          </span>
          <span>{parentId ? "Tạo issue con" : "Tạo issue mới"}</span>
        </span>
      }
      onClose={onClose}
    >
      <IssueForm
        initialValues={parentId ? { parentId } : undefined}
        submitLabel="Tạo issue"
        checkDuplicate
        onCancel={onClose}
        onSubmit={async (payload) => {
          await onCreate(payload);
          onClose();
        }}
      />
    </Modal>
  );
}
