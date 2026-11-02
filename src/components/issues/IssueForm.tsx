"use client";
import { useState, type FormEvent } from "react";
import { Avatar, Button, Input, Select, Textarea } from "@/components/ui";
import { UserRound } from "lucide-react";
import { STANDARD_LABELS } from "@/constants";
import { useAssignees, useDuplicateCheck, useRepoId } from "@/hooks";
import type { CreateIssuePayload } from "@/types";
import { getErrorMessage } from "@/utils";
import { DuplicateWarning } from "./DuplicateWarning";
import { DueDatePicker } from "./DueDatePicker";
import { IssueLabelIcon } from "./IssueLabelIcon";
interface IssueFormValues {
  title: string;
  body: string;
  label: string;
  assignees: string[];
  dueDate: string;
}
interface IssueFormProps {
  initialValues?: Partial<IssueFormValues>;
  submitLabel: string;
  checkDuplicate?: boolean;
  onSubmit: (payload: CreateIssuePayload) => Promise<void>;
  onCancel: () => void;
}
const LABEL_OPTIONS = [
  { value: "", label: "No label" },
  ...STANDARD_LABELS.map((label) => ({
    value: label.name,
    label: label.title,
    icon: <IssueLabelIcon name={label.name} />,
  })),
];
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
    label: "",
    assignees: [],
    dueDate: "",
    ...initialValues,
  });
  const { assignees, loading: assigneesLoading } = useAssignees(repoId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { result, checking, check, reset } = useDuplicateCheck(repoId);
  const updateValue = (
    key: keyof Pick<IssueFormValues, "title" | "body" | "label" | "dueDate">,
    value: string,
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    reset();
  };
  const buildPayload = (): CreateIssuePayload => ({
    title: values.title.trim(),
    body: values.body.trim() || undefined,
    labels: values.label ? [values.label] : [],
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
    <form onSubmit={handleSubmit} className="flex min-h-[22rem] flex-col gap-6">
      <Input
        name="title"
        label=""
        placeholder="Tiêu đề issue"
        value={values.title}
        className="h-10 border-transparent bg-transparent px-0 text-base font-semibold shadow-none focus-visible:ring-0"
        onChange={(event) => updateValue("title", event.target.value)}
      />
      <Textarea
        name="body"
        label=""
        rows={6}
        className="min-h-40 resize-y border-transparent bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
        placeholder="Thêm mô tả..."
        value={values.body}
        onChange={(event) => updateValue("body", event.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2 border-t pt-5">
        <Select
          aria-label="Người thực hiện"
          options={assigneeOptions}
          value={values.assignees[0] ?? ""}
          onChange={(nextValue) =>
            setValues((current) => ({ ...current, assignees: nextValue ? [nextValue] : [] }))
          }
          disabled={assigneesLoading}
          className="h-10 w-auto min-w-44 shrink-0 rounded-full border-border bg-secondary px-4"
        />
        <Select
          aria-label="Nhãn"
          name="label"
          options={LABEL_OPTIONS}
          value={values.label}
          onChange={(nextValue) => updateValue("label", nextValue)}
          className="h-10 w-auto min-w-32 shrink-0 rounded-full border-border bg-secondary px-4"
        />
        <DueDatePicker value={values.dueDate} onChange={(value) => updateValue("dueDate", value)} />
      </div>
      {duplicates.length > 0 && (
        <DuplicateWarning
          candidates={duplicates}
          submitting={submitting}
          onConfirm={submit}
          onBack={reset}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="ghost" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" loading={checking || submitting}>
          {checking ? "Đang kiểm tra trùng..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
