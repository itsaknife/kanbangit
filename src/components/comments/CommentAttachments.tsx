"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Download, ImageIcon, Paperclip, Trash2 } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { useCommentsStore } from "@/stores/comments.store";
import type { Attachment } from "@/types/collaboration.types";
import { getErrorMessage } from "@/utils";
export function CommentAttachments({
  repoId,
  commentId,
  attachments,
  canEdit,
  busy,
  onChange,
}: {
  repoId: string;
  commentId: string;
  attachments: Attachment[];
  canEdit: boolean;
  busy: boolean;
  onChange: () => Promise<void>;
}) {
  const upload = useCommentsStore((s) => s.upload),
    download = useCommentsStore((s) => s.download),
    remove = useCommentsStore((s) => s.removeAttachment);
  const [error, setError] = useState<string | null>(null),
    [pending, setPending] = useState(false),
    [preview, setPreview] = useState<{ url: string; name: string } | null>(null),
    [deleting, setDeleting] = useState<Attachment | null>(null);
  const imageUrl = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (imageUrl.current) URL.revokeObjectURL(imageUrl.current);
    },
    [],
  );
  const closePreview = () => {
    if (imageUrl.current) URL.revokeObjectURL(imageUrl.current);
    imageUrl.current = null;
    setPreview(null);
  };
  const getFile = async (file: Attachment, show = false) => {
    setPending(true);
    setError(null);
    try {
      const blob = await download(repoId, file.id),
        url = URL.createObjectURL(blob);
      if (show) {
        if (imageUrl.current) URL.revokeObjectURL(imageUrl.current);
        imageUrl.current = url;
        setPreview({ url, name: file.fileName });
      } else {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = file.fileName;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="mt-3 space-y-2">
      {attachments.map((file) => (
        <div
          key={file.id}
          className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-xs"
        >
          <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="min-w-0 flex-1 break-all">{file.fileName}</span>
          <span className="text-muted-foreground">{Math.ceil(file.fileSize / 1024)} KB</span>
          {file.mimeType.startsWith("image/") && (
            <Button
              size="sm"
              variant="ghost"
              disabled={pending || busy}
              onClick={() => getFile(file, true)}
              aria-label={`Xem ${file.fileName}`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            disabled={pending || busy}
            onClick={() => getFile(file)}
            aria-label={`Tải ${file.fileName}`}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          {canEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              disabled={pending || busy}
              onClick={() => setDeleting(file)}
              aria-label={`Xóa ${file.fileName}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}
      {canEdit && (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent">
          <Paperclip className="h-3.5 w-3.5" />
          Đính kèm ảnh hoặc mã nguồn · tối đa 2 MB/tệp
          <input
            type="file"
            multiple
            disabled={pending || busy}
            className="sr-only"
            onChange={async (e) => {
              const files = [...(e.target.files ?? [])];
              e.target.value = "";
              setError(null);
              setPending(true);
              try {
                for (const file of files) {
                  if (file.size > 2 * 1024 * 1024 || !file.size)
                    throw new Error("Mỗi tệp phải không rỗng và tối đa 2 MB");
                  await upload(repoId, commentId, file);
                }
              } catch (err) {
                setError(getErrorMessage(err));
              } finally {
                setPending(false);
                await onChange();
              }
            }}
          />
        </label>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      {preview && (
        <Modal open title={preview.name} onClose={closePreview}>
          <div className="relative h-[60vh]">
            <Image
              src={preview.url}
              alt={preview.name}
              fill
              className="object-contain"
              sizes="80vw"
              unoptimized
            />
          </div>
        </Modal>
      )}
      {deleting && (
        <Modal
          open
          title="Xóa tệp đính kèm"
          onClose={() => {
            if (!pending) setDeleting(null);
          }}
        >
          <p className="mb-4 text-sm">Xóa {deleting.fileName} khỏi bình luận?</p>
          {error && (
            <p role="alert" className="mb-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" disabled={pending} onClick={() => setDeleting(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              loading={pending}
              onClick={async () => {
                setPending(true);
                setError(null);
                try {
                  await remove(repoId, deleting.id);
                  setDeleting(null);
                  await onChange();
                } catch (err) {
                  setError(getErrorMessage(err));
                } finally {
                  setPending(false);
                }
              }}
            >
              Xóa tệp
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
