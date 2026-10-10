"use client";

import { useState, type FormEvent } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { STANDARD_LABELS } from "@/constants";
import { useDuplicateCheck, useRepoId } from "@/hooks";
import type { CreateIssuePayload } from "@/types";
import { getErrorMessage } from "@/utils";
import { DuplicateWarning } from "./DuplicateWarning";

interface IssueFormValues {
  title: string;
  body: string;
  /** Tên nhãn chuẩn đã chọn, "" nếu không gắn nhãn. */
  label: string;
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
    ...initialValues,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { result, checking, check, reset } = useDuplicateCheck(repoId);

  const updateValue = (key: keyof IssueFormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    reset(); // nội dung đã đổi nên kết quả kiểm tra trùng cũ không còn đúng
  };

  const buildPayload = (): CreateIssuePayload => ({
    title: values.title.trim(),
    body: values.body.trim() || undefined,
    labels: values.label ? [values.label] : [],
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
