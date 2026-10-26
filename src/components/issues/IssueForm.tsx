"use client";

import { useState, type FormEvent } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { STANDARD_LABELS } from "@/constants";
import { useAssignees, useDuplicateCheck, useRepoId } from "@/hooks";
import type { CreateIssuePayload } from "@/types";
import { getErrorMessage } from "@/utils";
import { DuplicateWarning } from "./DuplicateWarning";

interface IssueFormValues {
  title: string;
  body: string;
  /** Tên nhãn chuẩn đã chọn, "" nếu không gắn nhãn. */
  label: string;
  /** Tên tài khoản GitHub của những người được giao. */
  assignees: string[];
}

interface IssueFormProps {
  initialValues?: Partial<IssueFormValues>;
  submitLabel: string;
  /** Bật để AI kiểm tra trùng lặp trước khi gửi (dùng khi tạo issue mới). */
  checkDuplicate?: boolean;
  onSubmit: (payload: CreateIssuePayload) => Promise<void>;
  onCancel: () => void;
}

const LABEL_OPTIONS = [
  { value: "", label: "Không gắn nhãn" },
  ...STANDARD_LABELS.map((label) => ({ value: label.name, label: label.title })),
];

/** Form dùng chung cho tạo mới và chỉnh sửa issue. */
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
    ...initialValues,
  });
  const { assignees: assigneeOptions, loading: assigneesLoading } = useAssignees(repoId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { result, checking, check, reset } = useDuplicateCheck(repoId);

  const toggleAssignee = (login: string) => {
    setValues((current) => ({
      ...current,
      assignees: current.assignees.includes(login)
        ? current.assignees.filter((item) => item !== login)
        : [...current.assignees, login],
    }));
  };

  const updateValue = (key: "title" | "body" | "label", value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    reset(); // nội dung đã đổi nên kết quả kiểm tra trùng cũ không còn đúng
  };

  const buildPayload = (): CreateIssuePayload => ({
    title: values.title.trim(),
    body: values.body.trim() || undefined,
    labels: values.label ? [values.label] : [],
    assignees: values.assignees,
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
      if (duplicateResult?.isDuplicate) return; // hiện cảnh báo, chờ người dùng quyết định
    }
    await submit();
  };

  const duplicates = result?.isDuplicate ? result.candidates : [];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Tiêu đề"
        name="title"
        placeholder="Mô tả ngắn gọn công việc"
        value={values.title}
        onChange={(event) => updateValue("title", event.target.value)}
      />
      <Textarea
        label="Mô tả"
        name="body"
        rows={6}
        placeholder="Mô tả chi tiết: chuyện gì xảy ra, cần làm gì, tiêu chí hoàn thành..."
        value={values.body}
        onChange={(event) => updateValue("body", event.target.value)}
      />
      <Select
        label="Nhãn"
        name="label"
        options={LABEL_OPTIONS}
        value={values.label}
        onChange={(event) => updateValue("label", event.target.value)}
      />

      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm font-medium">Người thực hiện</legend>
        {assigneesLoading ? (
          <p className="text-sm text-zinc-500">Đang tải danh sách...</p>
        ) : assigneeOptions.length === 0 ? (
          <p className="text-sm text-zinc-500">Repository chưa có người nào để giao việc.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {assigneeOptions.map((person) => (
              <label
                key={person.login}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700"
              >
                <input
                  type="checkbox"
                  checked={values.assignees.includes(person.login)}
                  onChange={() => toggleAssignee(person.login)}
                />
                {person.login}
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {duplicates.length > 0 && (
        <DuplicateWarning
          candidates={duplicates}
          submitting={submitting}
          onConfirm={submit}
          onBack={reset}
        />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
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
