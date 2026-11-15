"use client";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useTrackersStore } from "@/stores/trackers.store";
import {
  Avatar,
  Button,
  DatePicker,
  Input,
  Select,
  Textarea,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";
import { CircleDashed, Clock3, GitBranch, UserRound } from "lucide-react";
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
  const dialog = layout === "dialog";
  const controlAppearance = dialog ? "pill" : "subtle";
  const controlLabelLayout = "vertical";
  const [estimateOpen, setEstimateOpen] = useState(false);
  const descriptionField = (
    <Textarea
      name="body"
      label={dialog ? undefined : "Mô tả"}
      aria-label="Mô tả"
      labelLayout={controlLabelLayout}
      rows={layout === "page" ? 7 : 4}
      maxLength={65000}
      className={
        layout === "page"
          ? "min-h-32 resize-y border-0 bg-transparent px-0 leading-7 shadow-none focus-visible:bg-muted/20 focus-visible:ring-0"
          : "min-h-36 resize-y border-0 bg-transparent px-0 leading-6 shadow-none focus-visible:bg-muted/20 focus-visible:ring-0"
      }
      placeholder="Thêm mô tả..."
      value={values.body}
      onChange={(event) => updateValue("body", event.target.value)}
    />
  );
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <fieldset disabled={checking || submitting} className="min-w-0 space-y-5 disabled:opacity-70">
        <Input
          name="title"
          aria-label="Tiêu đề"
          labelLayout={controlLabelLayout}
          required
          maxLength={256}
          placeholder="Tiêu đề issue"
          value={values.title}
          className={
            dialog
              ? "h-12 border-0 bg-transparent px-0 text-xl font-semibold shadow-none placeholder:text-muted-foreground/70 focus-visible:bg-muted/20 focus-visible:ring-0"
              : "h-14 border-0 bg-transparent px-0 text-2xl font-semibold shadow-none focus-visible:bg-muted/20 focus-visible:ring-0"
          }
          autoFocus={dialog}
          onChange={(event) => updateValue("title", event.target.value)}
        />
        {dialog && descriptionField}
        <section
          aria-label="Thuộc tính issue"
          className={
            dialog
              ? "space-y-3"
              : "py-1 [&_label]:px-2 [&_label]:text-xs [&_label]:font-normal [&_label]:text-muted-foreground"
          }
        >
          <div
            className={
              dialog
                ? "flex min-w-0 flex-wrap items-center gap-2"
                : "grid min-w-0 items-start gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3"
            }
          >
            {properties}
            {!properties && (
              <Select
                label="Trạng thái"
                labelLayout={controlLabelLayout}
                appearance={controlAppearance}
                value={values.status}
                options={BOARD_COLUMNS.map((column) => ({
                  value: column.status,
                  label: column.title,
                  icon: dialog ? (
                    <CircleDashed className="size-3.5 text-muted-foreground" />
                  ) : undefined,
                }))}
                onChange={(value) => {
                  const status = BOARD_COLUMNS.find((column) => column.status === value)?.status;
                  if (status) setValues((current) => ({ ...current, status }));
                }}
              />
            )}
            <Select
              label="Tracker"
              labelLayout={controlLabelLayout}
              appearance={controlAppearance}
              aria-label="Tracker"
              placeholder={trackerState?.loading ? "Đang tải tracker..." : "Chọn tracker"}
              options={trackerOptions.map((tracker) => ({
                value: tracker.id,
                label: tracker.name + (tracker.isActive ? "" : " (Đã vô hiệu hóa)"),
                icon: <TrackerIcon tracker={tracker} />,
                description:
                  tracker.prefix + " · " + (tracker.isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"),
                disabled: !tracker.isActive,
              }))}
              value={trackerId}
              disabled={!trackerOptions.length || trackerState?.loading}
              onChange={(value) => setValues((current) => ({ ...current, trackerId: value }))}
            />
            <Select
              label="Người thực hiện"
              labelLayout={controlLabelLayout}
              appearance={controlAppearance}
              aria-label="Người thực hiện"
              options={assigneeOptions}
              value={values.assigneeId}
              onChange={(value) => setValues((current) => ({ ...current, assigneeId: value }))}
              disabled={assigneesLoading}
              placeholder={assigneesLoading ? "Đang tải thành viên..." : "Chưa được giao"}
            />
            <Select
              label="Issue cha"
              labelLayout={controlLabelLayout}
              appearance={controlAppearance}
              value={values.parentId}
              disabled={issueState?.loading}
              options={[
                {
                  value: "",
                  label: dialog ? "Issue cha" : "Không có issue cha",
                  icon: dialog ? (
                    <GitBranch className="size-3.5 text-muted-foreground" />
                  ) : undefined,
                },
                ...parentOptions.map((item) => ({
                  value: item.id,
                  label: item.issueCode + " · " + item.title,
                  icon: dialog ? (
                    <GitBranch className="size-3.5 text-muted-foreground" />
                  ) : undefined,
                })),
                ...(values.parentId && !parentOptions.some((item) => item.id === values.parentId)
                  ? [{ value: values.parentId, label: values.parentId }]
                  : []),
              ]}
              onChange={(value) => updateValue("parentId", value)}
            />
            <DatePicker
              name="startDate"
              placeholder={dialog ? "Bắt đầu" : undefined}
              label="Ngày bắt đầu"
              labelLayout={controlLabelLayout}
              appearance={controlAppearance}
              value={values.startDate}
              max={values.endDate || undefined}
              onChange={(value) => updateValue("startDate", value)}
            />
            <DatePicker
              name="endDate"
              placeholder={dialog ? "Kết thúc" : undefined}
              label="Ngày kết thúc"
              labelLayout={controlLabelLayout}
              appearance={controlAppearance}
              value={values.endDate}
              min={values.startDate || undefined}
              onChange={(value) => updateValue("endDate", value)}
            />
            {dialog ? (
              <Popover open={estimateOpen} onOpenChange={setEstimateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label="Ước lượng (giờ)"
                    className="h-8 max-w-full rounded-full bg-muted/30 px-3 text-xs font-normal"
                  >
                    <Clock3 className="size-3.5 text-muted-foreground" />
                    {values.estimateHours === "" ? "Ước lượng" : values.estimateHours + " giờ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 space-y-3" aria-label="Ước lượng (giờ)">
                  <Input
                    name="estimateHours"
                    label="Estimate (h)"
                    type="number"
                    min={0}
                    step={0.5}
                    value={values.estimateHours}
                    placeholder="Chưa ước lượng"
                    disabled={checking || submitting}
                    onChange={(event) => updateValue("estimateHours", event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        setEstimateOpen(false);
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Nhập số giờ theo bước 0,5.</p>
                  <div className="flex flex-wrap gap-1">
                    {[0.5, 1, 2, 4, 8].map((hours) => (
                      <Button
                        key={hours}
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          updateValue("estimateHours", String(hours));
                          setEstimateOpen(false);
                        }}
                      >
                        {hours}h
                      </Button>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={checking || submitting || values.estimateHours === ""}
                    onClick={() => {
                      updateValue("estimateHours", "");
                      setEstimateOpen(false);
                    }}
                  >
                    Bỏ ước lượng
                  </Button>
                </PopoverContent>
              </Popover>
            ) : (
              <Input
                name="estimateHours"
                label="Estimate (h)"
                labelLayout={controlLabelLayout}
                type="number"
                min={0}
                step={0.5}
                value={values.estimateHours}
                placeholder="Chưa ước lượng"
                className="h-9 border-0 bg-transparent px-2 shadow-none hover:bg-accent/50"
                onChange={(event) => updateValue("estimateHours", event.target.value)}
              />
            )}
            <div className="space-y-1.5">
              <Select
                label="Label"
                labelLayout={controlLabelLayout}
                appearance={controlAppearance}
                aria-label="Label (tạm chưa sử dụng)"
                options={[]}
                disabled
                placeholder={dialog ? "Label" : "Chưa sử dụng"}
              />
            </div>
          </div>
          {assigneesError && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {assigneesError}
            </p>
          )}
          {issueState?.error && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {issueState.error}
            </p>
          )}
        </section>
        {!dialog && descriptionField}
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
          disabled={!trackerId || !trackerOptions.some((tracker) => tracker.id === trackerId)}
          loading={checking || submitting}
        >
          {checking ? "Đang kiểm tra trùng..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
