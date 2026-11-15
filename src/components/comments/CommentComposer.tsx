"use client";
import { useId, useRef, useState } from "react";
import { AtSign, Bold, Code2, Italic, Link2, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui";
import type { RepositoryMember } from "@/types/repository.types";
import { wrapSelection, mentionQuery, insertMention } from "@/utils/commentEditor";
import { getErrorMessage, cn } from "@/utils";
import { CommentContent } from "./CommentContent";
export function CommentComposer({
  initialContent = "",
  members,
  busy,
  onSave,
  onCancel,
}: {
  initialContent?: string;
  members: RepositoryMember[];
  busy: boolean;
  onSave: (content: string) => Promise<void>;
  onCancel?: () => void;
}) {
  const [content, setContent] = useState(initialContent),
    [preview, setPreview] = useState(false),
    [caret, setCaret] = useState(0),
    [active, setActive] = useState(0),
    [dismissed, setDismissed] = useState(false),
    [error, setError] = useState<string | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const editorId = useId();
  const query = preview || dismissed ? null : mentionQuery(content, caret);
  const suggestions = query
    ? members.filter((m) => m.isActive && m.login.toLowerCase().includes(query.query)).slice(0, 8)
    : [];
  const selectMention = (member: RepositoryMember) => {
    if (!query || !member.userId) return;
    const next = insertMention(content, query.start, query.end, member.login, member.userId);
    setContent(next.value);
    setCaret(next.caret);
    setDismissed(true);
    requestAnimationFrame(() => {
      field.current?.focus();
      field.current?.setSelectionRange(next.caret, next.caret);
    });
  };
  const format = (prefix: string, suffix?: string, placeholder?: string) => {
    setPreview(false);
    const next = wrapSelection(
      content,
      field.current?.selectionStart ?? content.length,
      field.current?.selectionEnd ?? content.length,
      prefix,
      suffix,
      placeholder,
    );
    setContent(next.value);
    setCaret(next.end);
    requestAnimationFrame(() => {
      field.current?.focus();
      field.current?.setSelectionRange(next.start, next.end);
    });
  };
  const controls = [
    { label: "Đậm", icon: Bold, prefix: "**", suffix: "**" },
    { label: "Nghiêng", icon: Italic, prefix: "*", suffix: "*" },
    { label: "Liên kết", icon: Link2, prefix: "[", suffix: "](https://)" },
    { label: "Danh sách", icon: List, prefix: "\n- ", suffix: "" },
    { label: "Danh sách có thứ tự", icon: ListOrdered, prefix: "\n1. ", suffix: "" },
    { label: "Code", icon: Code2, prefix: "\n```\n", suffix: "\n```\n" },
  ];
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        try {
          await onSave(content);
          setContent("");
          setCaret(0);
        } catch (err) {
          setError(getErrorMessage(err));
        }
      }}
    >
      <div className="rounded-lg border bg-card">
        <div className="flex flex-wrap items-center gap-1 border-b px-2 py-1.5">
          {controls.map(({ label, icon: Icon, prefix, suffix }) => (
            <Button
              key={label}
              size="sm"
              variant="ghost"
              title={label}
              aria-label={label}
              disabled={busy}
              onClick={() => format(prefix, suffix)}
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            title="Nhắc thành viên"
            aria-label="Nhắc thành viên"
            disabled={busy}
            onClick={() => {
              setPreview(false);
              const pos = field.current?.selectionStart ?? content.length;
              const value = content.slice(0, pos) + " @" + content.slice(pos);
              setContent(value);
              setCaret(pos + 2);
              setDismissed(false);
              requestAnimationFrame(() => {
                field.current?.focus();
                field.current?.setSelectionRange(pos + 2, pos + 2);
              });
            }}
          >
            <AtSign className="h-3.5 w-3.5" />
          </Button>
          <Button
            className="ml-auto"
            variant="ghost"
            size="sm"
            aria-pressed={preview}
            onClick={() => setPreview(!preview)}
          >
            {preview ? "Soạn thảo" : "Xem trước"}
          </Button>
        </div>
        {preview ? (
          <div className="min-h-36 px-4 py-2">
            <CommentContent content={content || "*Chưa có nội dung*"} />
          </div>
        ) : (
          <div className="relative">
            <textarea
              ref={field}
              role="combobox"
              aria-autocomplete="list"
              aria-label="Nội dung bình luận"
              aria-describedby={editorId + "-help"}
              aria-controls={editorId + "-mentions"}
              aria-expanded={!!query}
              aria-activedescendant={
                query && suggestions[active] ? editorId + "-" + suggestions[active].id : undefined
              }
              className="min-h-36 w-full resize-y bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              maxLength={50000}
              required
              value={content}
              disabled={busy}
              placeholder="Viết bình luận… Nhập @ để nhắc thành viên"
              onChange={(e) => {
                setContent(e.target.value);
                setCaret(e.target.selectionStart);
                setActive(0);
                setDismissed(false);
              }}
              onSelect={(e) => setCaret(e.currentTarget.selectionStart)}
              onKeyDown={(e) => {
                if (!query) return;
                if (e.key === "Escape") {
                  e.preventDefault();
                  setDismissed(true);
                }
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive(
                    (i) =>
                      (i + (e.key === "ArrowDown" ? 1 : -1) + Math.max(suggestions.length, 1)) %
                      Math.max(suggestions.length, 1),
                  );
                }
                if (e.key === "Enter" && suggestions[active]?.userId) {
                  e.preventDefault();
                  selectMention(suggestions[active]);
                }
              }}
            />
            {query && (
              <div
                id={editorId + "-mentions"}
                role="listbox"
                aria-label="Thành viên repository"
                className="absolute bottom-3 left-3 z-20 max-h-64 w-72 overflow-y-auto rounded-lg border bg-popover p-1 shadow-lg"
              >
                {suggestions.length ? (
                  suggestions.map((member, i) => (
                    <button
                      key={member.id}
                      id={editorId + "-" + member.id}
                      role="option"
                      aria-selected={active === i}
                      disabled={!member.userId}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectMention(member)}
                      className={cn(
                        "flex w-full flex-col rounded-md px-3 py-2 text-left text-sm disabled:opacity-50",
                        active === i ? "bg-accent" : "hover:bg-accent",
                      )}
                    >
                      <span>@{member.login}</span>
                      {!member.userId && (
                        <span className="text-xs text-muted-foreground">
                          Chưa đăng nhập KanbanGit
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-3 text-xs text-muted-foreground">
                    Không tìm thấy thành viên.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p id={editorId + "-help"} className="text-xs text-muted-foreground">
          Hỗ trợ Markdown · Chỉ lưu trong KanbanGit
        </p>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="secondary" size="sm" disabled={busy} onClick={onCancel}>
              Hủy
            </Button>
          )}
          <Button type="submit" size="sm" loading={busy} disabled={!content.trim()}>
            {onCancel ? "Lưu bình luận" : "Gửi bình luận"}
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
