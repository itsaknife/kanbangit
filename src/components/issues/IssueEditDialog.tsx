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
  const { updateIssue } = useIssue(repoId, issue.id);
  return (
    <Modal open={open} title={`Chỉnh sửa issue ${issue.issueCode}`} onClose={onClose}>
      <IssueForm
        initialAssignee={issue.assignees[0]}
        issueId={issue.id}
        initialValues={{
          trackerId: issue.trackerId,
          title: issue.title,
          body: issue.body ?? "",
          assigneeId: issue.assigneeId ?? "",
          startDate: issue.startDate ?? "",
          endDate: issue.endDate ?? "",
          estimateHours: issue.estimateMinutes === null ? "" : String(issue.estimateMinutes / 60),
          parentId: issue.parentId ?? "",
          status: issue.status,
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
