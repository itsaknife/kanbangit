"use client";

import { Modal } from "@/components/ui";
import type { CreateIssuePayload } from "@/types";
import { IssueForm } from "./IssueForm";

interface CreateIssueModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateIssuePayload) => Promise<unknown>;
}

/** Hộp thoại tạo issue mới (có AI kiểm tra trùng lặp). Dùng ở cả Kanban và danh sách issue. */
export function CreateIssueModal({ open, onClose, onCreate }: CreateIssueModalProps) {
  return (
    <Modal open={open} title="Tạo issue mới" onClose={onClose}>
      <IssueForm
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
