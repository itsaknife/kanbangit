"use client";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useTrackersStore } from "@/stores/trackers.store";
import { Avatar, Button, Input, Select, Textarea } from "@/components/ui";
import { Tag, UserRound } from "lucide-react";
import { TrackerIcon } from "@/components/repositories/TrackerIcon";
import { useAssignees, useDuplicateCheck, useRepoId } from "@/hooks";
import type { CreateIssuePayload, UserSummary } from "@/types";
import { getErrorMessage } from "@/utils";
import { DuplicateWarning } from "./DuplicateWarning";
import { BOARD_COLUMNS } from "@/constants";
import { useIssuesStore } from "@/stores/issues.store";
import type { IssueStatus } from "@/types";
interface IssueFormValues {
  title: string;
  body: string;
  assigneeId: string;
  startDate: string;
  endDate: string;
  estimateHours: string;
  parentId: string;
  status: IssueStatus;
  trackerId: string;
}
interface IssueFormProps {
  initialValues?: Partial<IssueFormValues>;
  issueId?: string;
  initialAssignee?: UserSummary;
  submitLabel: string;
  checkDuplicate?: boolean;
  onSubmit: (payload: CreateIssuePayload) => Promise<void>;
  onCancel: () => void;
  layout?: "dialog" | "page";
  properties?: ReactNode;
}
export function IssueForm({
  initialValues,
  issueId,
  initialAssignee,
  submitLabel,
  checkDuplicate = false,
  onSubmit,
  onCancel,
  layout = "dialog",
  properties,
}: IssueFormProps) {
  const repoId = useRepoId();
  const [values, setValues] = useState<IssueFormValues>({
    title: "",
    body: "",
    assigneeId: "",
    startDate: "",
    endDate: "",
    estimateHours: "",
    parentId: "",
    status: "todo",
    trackerId: "",
    ...initialValues,
  });
  const { assignees, loading: assigneesLoading, error: assigneesError } = useAssignees(repoId);
  const issueState = useIssuesStore((s) => s.byRepository[repoId]);
  const fetchIssues = useIssuesStore((s) => s.fetchIssues);
  useEffect(() => {
    if (!issueState?.loaded && !issueState?.loading && !issueState?.error) void fetchIssues(repoId);
  }, [repoId, fetchIssues, issueState?.loaded, issueState?.loading, issueState?.error]);
  const parentOptions = (issueState?.issues ?? []).filter((item) => item.id !== issueId);

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
  const updateValue = (key: keyof Omit<IssueFormValues, "status">, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    reset();
  };
  const buildPayload = (): CreateIssuePayload => ({
    trackerId,
    title: values.title.trim(),
    body: initialValues ? values.body.trim() : values.body.trim() || undefined,
    assigneeId: values.assigneeId || null,
    startDate: values.startDate || null,
    endDate: values.endDate || null,
    estimateMinutes: values.estimateHours === "" ? null : Number(values.estimateHours) * 60,
    parentId: values.parentId || null,
    ...(properties ? {} : { status: values.status }),
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
    if (values.startDate && values.endDate && values.startDate > values.endDate) {
      setError("Ngày kết thúc phải từ ngày bắt đầu trở đi.");
      return;
    }
    const estimate = Number(values.estimateHours) * 60;
    if (
      values.estimateHours !== "" &&
      (!Number.isSafeInteger(estimate) || estimate < 0 || estimate % 30 !== 0)
    ) {
      setError("Ước lượng phải là số giờ không âm, theo bước 0,5 giờ.");
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
    ...(values.assigneeId && !assignees.some((person) => person.id === values.assigneeId)
      ? [
        {
          value: values.assigneeId,
          label: `${initialAssignee?.login ?? "Người thực hiện hiện tại"} (không còn khả dụng)`,
          icon: initialAssignee ? (
            <Avatar src={initialAssignee.avatarUrl} alt="" size={20} />
          ) : undefined,
          disabled: true,
        },
      ]
      : []),
    ...assignees.map((person) => ({
      value: person.id,
      label: person.login,
      icon: <Avatar src={person.avatarUrl ?? ""} alt="" size={20} />,
    })),
  ];
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <fieldset
        disabled={checking || submitting}
        className={
          layout === "page"
            ? "grid min-w-0 gap-8 disabled:opacity-70 lg:grid-cols-[minmax(0,1fr)_300px]"
            : "min-w-0 space-y-5 disabled:opacity-70"
        }
      >
        <div className="min-w-0 space-y-5">
          <Input
            name="title"
            label="Tiêu đề"
            required
            maxLength={256}
            placeholder="Tiêu đề issue"
            value={values.title}
            className={
              layout === "page"
                ? "h-12 bg-background text-lg font-semibold"
                : "h-11 bg-muted/25 font-medium"
            }
            onChange={(event) => updateValue("title", event.target.value)}
          />
          <Textarea
            name="body"
            label="Mô tả"
            rows={6}
            maxLength={65000}
            className={
              layout === "page"
                ? "min-h-[360px] resize-y bg-background leading-7"
                : "min-h-36 resize-y bg-muted/25 leading-6"
            }
            placeholder="Thêm mô tả..."
            value={values.body}
            onChange={(event) => updateValue("body", event.target.value)}
          />
        </div>
        <div
          className={
            layout === "page"
              ? "flex flex-col gap-5 rounded-lg border bg-muted/20 p-5 lg:self-start"
              : "grid gap-x-5 gap-y-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2"
          }
        >
          {properties}
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
            value={values.assigneeId}
            onChange={(nextValue) =>
              setValues((current) => ({ ...current, assigneeId: nextValue }))
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
          {!properties && (
            <Select
              label="Trạng thái"
              value={values.status}
              options={BOARD_COLUMNS.map((column) => ({
                value: column.status,
                label: column.title,
              }))}
              onChange={(value) => {
                const status = BOARD_COLUMNS.find((c) => c.status === value)?.status;
                if (status) setValues((current) => ({ ...current, status }));
              }}
            />
          )}
          <Input
            name="startDate"
            label="Ngày bắt đầu"
            type="date"
            value={values.startDate}
            max={values.endDate || undefined}
            onChange={(event) => updateValue("startDate", event.target.value)}
          />
          <Input
            name="endDate"
            label="Ngày kết thúc"
            type="date"
            value={values.endDate}
            min={values.startDate || undefined}
            onChange={(event) => updateValue("endDate", event.target.value)}
          />
          <Input
            name="estimateHours"
            label="Estimate (h)"
            type="number"
            min={0}
            step={0.5}
            value={values.estimateHours}
            placeholder="Chưa ước lượng"
            onChange={(event) => updateValue("estimateHours", event.target.value)}
          />
          <Select
            label="Issue cha"
            value={values.parentId}
            disabled={issueState?.loading}
            options={[
              { value: "", label: "Không có issue cha" },
              ...parentOptions.map((item) => ({
                value: item.id,
                label: item.issueCode + " · " + item.title,
              })),
              ...(values.parentId && !parentOptions.some((item) => item.id === values.parentId)
                ? [{ value: values.parentId, label: values.parentId }]
                : []),
            ]}
            onChange={(value) => updateValue("parentId", value)}
          />
          <p className="text-xs text-muted-foreground">
            Tối đa 3 cấp trong cùng repository. Hệ thống kiểm tra quan hệ khi lưu.
          </p>
          {assigneesError && (
            <p role="alert" className="text-sm text-destructive">
              {assigneesError}
            </p>
          )}
          {issueState?.error && (
            <p role="alert" className="text-sm text-destructive">
              {issueState.error}
            </p>
          )}
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
