"use client";
import { useEffect, useState } from "react";
import { MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Avatar, Button, ErrorMessage, Modal, Spinner } from "@/components/ui";
import { useCommentsStore, commentKey } from "@/stores/comments.store";
import { useMembersStore } from "@/stores/members.store";
import { useCollaborationRefresh } from "@/hooks/useCollaborationRefresh";
import { formatDateTime, getErrorMessage } from "@/utils";
import type { Comment } from "@/types/collaboration.types";
import { CommentComposer } from "./CommentComposer";
import { CommentContent } from "./CommentContent";
import { CommentAttachments } from "./CommentAttachments";
export function IssueComments({ repoId, issueId }: { repoId: string; issueId: string }) {
  const entry = useCommentsStore((s) => s.entries[commentKey(repoId, issueId)]),
    busy = useCommentsStore((s) => s.busy);
  const load = useCommentsStore((s) => s.load),
    save = useCommentsStore((s) => s.save),
    remove = useCommentsStore((s) => s.remove);
  const members = useMembersStore((s) => s.byRepository[repoId]?.members),
    loadMembers = useMembersStore((s) => s.fetch);
  const [editing, setEditing] = useState<string | null>(null),
    [deleting, setDeleting] = useState<Comment | null>(null),
    [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void load(repoId, issueId);
  }, [repoId, issueId, load]);
  useEffect(() => {
    void loadMembers(repoId);
  }, [repoId, loadMembers]);
  useCollaborationRefresh(repoId, () => {
    void load(repoId, issueId);
  });
  return (
    <section className="space-y-5 border-t pt-6" id="comments">
      <h2 className="flex items-center gap-2 font-semibold">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        Bình luận{" "}
        <span className="text-xs font-normal text-muted-foreground">{entry?.data.length ?? 0}</span>
      </h2>
      {entry?.error && <ErrorMessage message={entry.error} onRetry={() => load(repoId, issueId)} />}
      {entry?.loading && !entry.data.length && <Spinner />}
      {entry && !entry.loading && !entry.error && !entry.data.length && (
        <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Chưa có bình luận. Bắt đầu trao đổi về issue này.
        </p>
      )}
      {entry?.data.map((comment) => (
        <article
          id={`comment-${comment.id}`}
          key={comment.id}
          className="rounded-lg border bg-card p-4"
        >
          <header className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Avatar
                src={comment.author.avatarUrl ?? ""}
                alt={comment.author.name}
                size={28}
                unoptimized
              />
              <div>
                <span className="text-sm font-medium">{comment.author.name}</span>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(comment.createdAt)}
                  {comment.createdAt !== comment.updatedAt ? " · Đã chỉnh sửa" : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              {comment.canEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Sửa bình luận"
                  disabled={busy}
                  onClick={() => setEditing(comment.id)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              {comment.canDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  aria-label="Xóa bình luận"
                  disabled={busy}
                  onClick={() => {
                    setError(null);
                    setDeleting(comment);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </header>
          {editing === comment.id ? (
            <CommentComposer
              initialContent={comment.content}
              members={members ?? []}
              busy={busy}
              onCancel={() => setEditing(null)}
              onSave={async (content) => {
                await save(repoId, issueId, content, comment.id);
                setEditing(null);
                await load(repoId, issueId);
              }}
            />
          ) : (
            <CommentContent content={comment.content} />
          )}
          <CommentAttachments
            repoId={repoId}
            commentId={comment.id}
            attachments={comment.attachments}
            canEdit={comment.canEdit}
            busy={busy}
            onChange={() => load(repoId, issueId)}
          />
        </article>
      ))}
      <CommentComposer
        members={members ?? []}
        busy={busy}
        onSave={async (content) => {
          await save(repoId, issueId, content);
          await load(repoId, issueId);
        }}
      />
      {deleting && (
        <Modal
          open
          title="Xóa bình luận"
          onClose={() => {
            if (!busy) setDeleting(null);
          }}
        >
          <p className="mb-4 text-sm">
            Bình luận và các tệp đính kèm sẽ bị xóa. Bạn muốn tiếp tục?
          </p>
          {error && (
            <p role="alert" className="mb-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" disabled={busy} onClick={() => setDeleting(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={async () => {
                try {
                  await remove(repoId, deleting.id);
                  setDeleting(null);
                  await load(repoId, issueId);
                } catch (err) {
                  setError(getErrorMessage(err));
                }
              }}
            >
              Xóa bình luận
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
