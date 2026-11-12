"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useTrackersStore } from "@/stores/trackers.store";
import { Avatar, Button, Input, Select, Textarea } from "@/components/ui";
import { Tag, UserRound } from "lucide-react";
import { TrackerIcon } from "@/components/repositories/TrackerIcon";
import { useAssignees, useDuplicateCheck, useRepoId } from "@/hooks";
import type { CreateIssuePayload } from "@/types";
import { getErrorMessage } from "@/utils";
import { DuplicateWarning } from "./DuplicateWarning";
import { DueDatePicker } from "./DueDatePicker";
interface IssueFormValues {
  title: string;
  body: string;
  assignees: string[];
  dueDate: string;
  trackerId: string;
}
interface IssueFormProps {
  initialValues?: Partial<IssueFormValues>;
  submitLabel: string;
  checkDuplicate?: boolean;
  onSubmit: (payload: CreateIssuePayload) => Promise<void>;
  onCancel: () => void;
}
export function IssueForm({
  initialValues,
  submitLabel,
  checkDuplicate = false,
  onSubmit,
  onCancel,
}: IssueFormProps) {
  const repoId = useRepoId();
  const [values, setValues] = useState<IssueFormValues>({
    title: "",
    body: "",
    assignees: [],
    dueDate: "",
    trackerId: "",
    ...initialValues,
  });
  const { assignees, loading: assigneesLoading } = useAssignees(repoId);
  const trackerState = useTrackersStore((s) => s.byRepository[repoId]);
  const fetchTrackers = useTrackersStore((s) => s.fetch);
  useEffect(() => {
    void fetchTrackers(repoId);
  }, [repoId, fetchTrackers]);
  const activeTrackers = trackerState?.items.filter((t) => t.isActive) ?? [];
  const selectedInactive = trackerState?.items.find(
    (t) => t.id === initialValues?.trackerId && !t.isActive,
  );
  const trackerOptions = selectedInactive ? [...activeTrackers, selectedInactive] : activeTrackers;
  const trackerId = values.trackerId || activeTrackers[0]?.id || "";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { result, checking, check, reset } = useDuplicateCheck(repoId);
  const updateValue = (
    key: keyof Pick<IssueFormValues, "title" | "body" | "dueDate">,
    value: string,
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    reset();
  };
  const buildPayload = (): CreateIssuePayload => ({
    trackerId,
    title: values.title.trim(),
    body: values.body.trim() || undefined,
    // Label editing is paused. Omit it on edits to preserve existing GitHub labels.
    ...(initialValues ? {} : { labels: [] }),
    assignees: values.assignees,
    dueDate: values.dueDate || null,
  });
  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(buildPayload());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!values.title.trim()) {
      setError("Vui lòng nhập tiêu đề");
      return;
    }
    if (!trackerId || !trackerOptions.some((tracker) => tracker.id === trackerId)) {
      setError("Cần chọn Tracker đang hoạt động.");
      return;
    }
    setError(null);
    if (checkDuplicate) {
      const payload = buildPayload();
      const duplicateResult = await check({ title: payload.title, body: payload.body });
      if (duplicateResult?.isDuplicate) return;
    }
    await submit();
  };
  const duplicates = result?.isDuplicate ? result.candidates : [];
  const assigneeOptions = [
    {
      value: "",
      label: "Chưa được giao",
      icon: <UserRound className="h-4 w-4 text-muted-foreground" />,
    },
    ...assignees.map((person) => ({
      value: person.login,
      label: person.login,
      icon: <Avatar src={person.avatarUrl} alt="" size={20} />,
    })),
  ];
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <fieldset disabled={checking || submitting} className="min-w-0 space-y-5 disabled:opacity-70">
        <Input
          name="title"
          label="Tiêu đề"
          required
          maxLength={256}
          placeholder="Tiêu đề issue"
          value={values.title}
          className="h-11 bg-muted/25 font-medium"
          onChange={(event) => updateValue("title", event.target.value)}
        />
        <Textarea
          name="body"
          label="Mô tả"
          rows={6}
          className="min-h-36 resize-y bg-muted/25 leading-6"
          placeholder="Thêm mô tả..."
          value={values.body}
          onChange={(event) => updateValue("body", event.target.value)}
        />
        <div className="grid gap-x-5 gap-y-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2">
          <Select
            label="Tracker"
            aria-label="Tracker"
            placeholder={trackerState?.loading ? "Đang tải tracker..." : "Chọn tracker"}
            options={trackerOptions.map((t) => ({
              value: t.id,
              label: t.name + (t.isActive ? "" : " (Đã vô hiệu hóa)"),
              icon: <TrackerIcon tracker={t} />,
              description: `${t.prefix} · ${t.isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"}`,
              disabled: !t.isActive,
            }))}
            value={trackerId}
            disabled={!trackerOptions.length || trackerState?.loading}
            onChange={(value) => setValues((current) => ({ ...current, trackerId: value }))}
          />
          <Select
            label="Người thực hiện"
            aria-label="Người thực hiện"
            options={assigneeOptions}
            value={values.assignees[0] ?? ""}
            onChange={(nextValue) =>
              setValues((current) => ({ ...current, assignees: nextValue ? [nextValue] : [] }))
            }
            disabled={assigneesLoading}
            placeholder={assigneesLoading ? "Đang tải thành viên..." : "Chưa được giao"}
          />
          <div className="space-y-1.5">
            <Select
              label="Label"
              aria-label="Label (tạm chưa sử dụng)"
              options={[]}
              disabled
              placeholder="Chưa sử dụng"
            />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Tag className="h-3 w-3" aria-hidden="true" />
              Tạm để trống.
            </p>
          </div>
          <div className="space-y-1.5">
            <span className="text-sm font-medium">Hạn hoàn thành</span>
            <DueDatePicker
              value={values.dueDate}
              onChange={(value) => updateValue("dueDate", value)}
            />
          </div>
        </div>
      </fieldset>
      {duplicates.length > 0 && (
        <DuplicateWarning
          candidates={duplicates}
          submitting={submitting}
          onConfirm={submit}
          onBack={reset}
        />
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {trackerState?.error && <p role="alert">{trackerState.error}</p>}
      {trackerState?.loaded && !activeTrackers.length && (
        <p role="status">Không có Tracker hoạt động. Hãy nhờ Owner kích hoạt Tracker.</p>
      )}
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="secondary" disabled={checking || submitting} onClick={onCancel}>
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={!trackerId || !trackerOptions.some((t) => t.id === trackerId)}
          loading={checking || submitting}
        >
          {checking ? "Đang kiểm tra trùng..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
