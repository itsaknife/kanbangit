"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  Button,
  ErrorMessage,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
} from "@/components/ui";
import { useNotificationsStore } from "@/stores/notifications.store";
import { formatDateTime, getErrorMessage } from "@/utils";
export function MentionNotifications() {
  const [open, setOpen] = useState(false),
    [error, setError] = useState<string | null>(null);
  const data = useNotificationsStore((s) => s.data),
    unread = useNotificationsStore((s) => s.unreadCount),
    loading = useNotificationsStore((s) => s.loading),
    loadError = useNotificationsStore((s) => s.error);
  const load = useNotificationsStore((s) => s.load),
    read = useNotificationsStore((s) => s.read),
    readAll = useNotificationsStore((s) => s.readAll);
  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 30000);
    const focus = () => void load();
    window.addEventListener("focus", focus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, [load]);
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void load();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="relative"
          aria-label={`Thông báo nhắc tên: ${unread} chưa đọc`}
          title="Thông báo nhắc tên"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Nhắc đến bạn</h2>
          <Button
            variant="ghost"
            size="sm"
            disabled={!unread || loading}
            onClick={async () => {
              try {
                await readAll();
                setError(null);
              } catch (e) {
                setError(getErrorMessage(e));
              }
            }}
          >
            Đọc tất cả
          </Button>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {(loadError || error) && (
            <ErrorMessage message={loadError || error || ""} onRetry={load} />
          )}
          {loading && !data.length && (
            <div className="p-5">
              <Spinner />
            </div>
          )}
          {!loading && !data.length && !loadError && (
            <p className="p-6 text-center text-sm text-muted-foreground">Chưa có lượt nhắc tên.</p>
          )}
          {data.map((item) => (
            <Link
              key={item.id}
              href={`/repositories/${item.repositoryId}/issues/${item.issueId}#comment-${item.commentId}`}
              className="block rounded-md px-3 py-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                setOpen(false);
                void read(item.id).catch((e) => setError(getErrorMessage(e)));
              }}
            >
              <p className="text-sm">
                {!item.readAt && (
                  <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                )}
                Bạn được nhắc trong <strong>{item.issue?.issueCode ?? "issue"}</strong>
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{item.issue?.title}</p>
              <time className="mt-1 block text-[11px] text-muted-foreground">
                {formatDateTime(item.createdAt)}
              </time>
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
