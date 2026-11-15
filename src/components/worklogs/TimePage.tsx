"use client";
import { useEffect, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";
import { Button, DatePicker, ErrorMessage, Modal, Select, Spinner } from "@/components/ui";
import { useRepoId } from "@/hooks";
import { useMembersStore } from "@/stores/members.store";
import { useWorklogsStore, worklogKey } from "@/stores/worklogs.store";
import type { TimeQuery, Worklog } from "@/types/collaboration.types";
import { formatDuration } from "@/utils/worklog";
import { formatDate, getErrorMessage } from "@/utils";
import { WorklogRows } from "./WorklogRows";
import { WorklogForm } from "./WorklogForm";
import { useCollaborationRefresh } from "@/hooks/useCollaborationRefresh";
export function TimePage() {
  const repoId = useRepoId();
  const [query, setQuery] = useState<TimeQuery>({ period: "week" }),
    [period, setPeriod] = useState("week"),
    [memberId, setMemberId] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const entry = useWorklogsStore((s) => s.entries[worklogKey(repoId, query)]);
  const load = useWorklogsStore((s) => s.load),
    save = useWorklogsStore((s) => s.save),
    remove = useWorklogsStore((s) => s.remove),
    busy = useWorklogsStore((s) => s.busy);
  const membership = useMembersStore((s) => s.byRepository[repoId]),
    loadMembers = useMembersStore((s) => s.fetch);
  const [editing, setEditing] = useState<Worklog | null>(null),
    [deleting, setDeleting] = useState<Worklog | null>(null),
    [error, setError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  useEffect(() => {
    void load(repoId, query);
  }, [repoId, query, load]);
  useEffect(() => {
    void loadMembers(repoId);
  }, [repoId, loadMembers]);
  useCollaborationRefresh(repoId, () => {
    void load(repoId, query);
  });
  return (
    <section className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Clock3 className="h-5 w-5" />
          Thời gian
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {membership?.canManage
            ? "Theo dõi thời gian của repository và từng thành viên."
            : "Theo dõi thời gian làm việc của bạn."}
        </p>
      </header>
      <form
        className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (period === "custom" && (!from || !to || from > to)) {
            setFilterError("Chọn đủ khoảng ngày hợp lệ: từ ngày không được sau đến ngày.");
            return;
          }
          setFilterError(null);
          setQuery({
            period,
            ...(membership?.canManage && memberId ? { memberId } : {}),
            ...(period === "custom" ? { from, to } : {}),
          });
        }}
      >
        <div className="w-44">
          <Select
            label="Khoảng thời gian"
            value={period}
            onChange={setPeriod}
            options={[
              { value: "week", label: "Tuần này" },
              { value: "month", label: "Tháng này" },
              { value: "custom", label: "Tùy chỉnh" },
              { value: "all", label: "Toàn bộ" },
            ]}
          />
        </div>
        {membership?.canManage && (
          <div className="w-52">
            <Select
              label="Thành viên"
              value={memberId}
              onChange={setMemberId}
              options={[
                { value: "", label: "Tất cả thành viên" },
                ...(membership.members ?? []).map((m) => ({
                  value: m.id,
                  label: m.login + (m.isActive ? "" : " · Ngừng hoạt động"),
                })),
              ]}
            />
          </div>
        )}
        {period === "custom" && (
          <>
            <DatePicker
              id="time-from"
              label="Từ ngày"
              required
              value={from}
              max={to || undefined}
              onChange={setFrom}
            />
            <DatePicker
              id="time-to"
              label="Đến ngày"
              required
              min={from}
              value={to}
              onChange={setTo}
            />
          </>
        )}
        <Button type="submit" variant="secondary" loading={entry?.loading}>
          Áp dụng
        </Button>
        <span className="pb-2 text-xs text-muted-foreground">Asia/Ho_Chi_Minh · UTC+7</span>
      </form>
      {filterError && <ErrorMessage message={filterError} />}
      {entry?.error && <ErrorMessage message={entry.error} onRetry={() => load(repoId, query)} />}
      {!entry?.data && entry?.loading && <Spinner />}
      {entry?.data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-card p-5">
              <p className="text-xs text-muted-foreground">Tổng thời gian trong khoảng đã chọn</p>
              <p className="mt-3 text-2xl font-semibold">
                {formatDuration(entry.data.totalMinutes)}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <p className="text-xs text-muted-foreground">Worklog</p>
              <p className="mt-3 text-2xl font-semibold">{entry.data.data.length}</p>
            </div>
          </div>
          {entry.data.daily.length > 0 && (
            <section className="rounded-lg border bg-card p-4">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4" />
                Phân bổ theo ngày
              </h2>
              <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                {entry.data.daily.map((day) => (
                  <div key={day.date} className="flex justify-between gap-4 border-b pb-2 text-sm">
                    <span className="text-muted-foreground">{formatDate(day.date)}</span>
                    <span className="font-medium">{formatDuration(day.durationMinutes)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
          <WorklogRows
            rows={entry.data.data}
            repoId={repoId}
            showIssue
            busy={busy}
            onEdit={setEditing}
            onDelete={(row) => {
              setError(null);
              setDeleting(row);
            }}
          />
        </>
      )}
      {editing && entry?.data && (
        <Modal
          open
          title="Sửa worklog"
          onClose={() => {
            if (!busy) setEditing(null);
          }}
        >
          <WorklogForm
            worklog={editing}
            members={membership?.members ?? []}
            canManage={entry.data.canManage}
            currentMemberId={entry.data.currentMemberId}
            busy={busy}
            onCancel={() => setEditing(null)}
            onSave={async (body) => {
              await save(repoId, editing.issueId, body, editing.id);
              setEditing(null);
              await load(repoId, query);
            }}
          />
        </Modal>
      )}
      {deleting && (
        <Modal
          open
          title="Xóa worklog"
          onClose={() => {
            if (!busy) setDeleting(null);
          }}
        >
          <p className="mb-5 text-sm">
            Xóa worklog của {deleting.member.name}? Thao tác này không thể hoàn tác.
          </p>
          {error && (
            <p role="alert" className="text-sm text-destructive">
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
                  await load(repoId, query);
                } catch (e) {
                  setError(getErrorMessage(e));
                }
              }}
            >
              Xóa
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
