"use client";
import { useState } from "react";
import { Button, DateTimePicker, Select, Textarea } from "@/components/ui";
import type { RepositoryMember } from "@/types/repository.types";
import type { Worklog, WorklogPayload } from "@/types/collaboration.types";
import {
  formatDuration,
  validateWorklogInput,
  vietnamDateTimeInput,
  worklogInputMinutes,
} from "@/utils/worklog";
import { getErrorMessage } from "@/utils";
export function WorklogForm({
  worklog,
  members,
  canManage,
  currentMemberId,
  busy,
  onSave,
  onCancel,
}: {
  worklog?: Worklog;
  members: RepositoryMember[];
  canManage: boolean;
  currentMemberId: string;
  busy: boolean;
  onSave: (body: WorklogPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [start, setStart] = useState(worklog ? vietnamDateTimeInput(worklog.startAt) : "");
  const [end, setEnd] = useState(worklog ? vietnamDateTimeInput(worklog.endAt) : "");
  const [description, setDescription] = useState(worklog?.description ?? "");
  const [memberId, setMemberId] = useState(worklog?.memberId ?? currentMemberId);
  const [error, setError] = useState<string | null>(null);
  const duration = worklogInputMinutes(start, end) ?? 0;
  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        try {
          await onSave({
            ...validateWorklogInput(start, end),
            description,
            ...(!worklog && canManage ? { memberId } : {}),
          });
        } catch (err) {
          setError(getErrorMessage(err));
        }
      }}
    >
      <p className="text-sm text-muted-foreground">
        Ghi lại thời gian đã làm việc. Múi giờ Việt Nam (UTC+7).
      </p>
      {worklog ? (
        <p className="text-sm">
          Người ghi nhận: <strong>{worklog.member.name}</strong>
        </p>
      ) : (
        canManage && (
          <Select
            label="Người ghi nhận"
            value={memberId}
            onChange={setMemberId}
            options={members
              .filter((m) => m.isActive)
              .map((m) => ({ value: m.id, label: m.login }))}
          />
        )
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <DateTimePicker
          id="worklog-start"
          label="Bắt đầu"
          required
          value={start}
          max={vietnamDateTimeInput(new Date().toISOString())}
          onChange={setStart}
        />
        <DateTimePicker
          id="worklog-end"
          label="Kết thúc"
          required
          value={end}
          max={vietnamDateTimeInput(new Date().toISOString())}
          onChange={setEnd}
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3 text-sm">
        <span className="text-muted-foreground">Thời lượng tự tính</span>
        <strong>
          {Number.isFinite(duration) && duration > 0 ? formatDuration(duration) : "—"}
        </strong>
      </div>
      <Textarea
        id="worklog-description"
        label="Nội dung công việc"
        rows={3}
        maxLength={10000}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Bạn đã thực hiện công việc gì?"
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          Hủy
        </Button>
        <Button type="submit" loading={busy}>
          {worklog ? "Lưu thay đổi" : "Ghi thời gian"}
        </Button>
      </div>
    </form>
  );
}
