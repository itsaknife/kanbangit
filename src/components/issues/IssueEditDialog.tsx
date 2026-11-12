"use client";
import { Modal } from "@/components/ui";
import { useIssue } from "@/hooks";
import type { Issue } from "@/types";
import { IssueForm } from "./IssueForm";
interface IssueEditDialogProps {
  issue: Issue;
  repoId: string;
  open: boolean;
  onClose: () => void;
}
export function IssueEditDialog({ issue, repoId, open, onClose }: IssueEditDialogProps) {
  const { updateIssue } = useIssue(repoId, issue.number);
  return (
    <Modal open={open} title={`Chỉnh sửa issue #${issue.number}`} onClose={onClose}>
      <IssueForm
        initialValues={{
          trackerId: issue.trackerId,
          title: issue.title,
          body: issue.body ?? "",
          assignees: issue.assignees.map((person) => person.login),
          dueDate: issue.dueDate ? issue.dueDate.slice(0, 10) : "",
        }}
        submitLabel="Lưu thay đổi"
        onCancel={onClose}
        onSubmit={async (payload) => {
          await updateIssue(payload);
          onClose();
        }}
      />
    </Modal>
  );
}
