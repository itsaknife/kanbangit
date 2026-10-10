import { Button, Input, Select } from "@/components/ui";
import { ALL, STANDARD_LABELS } from "@/constants";
import type { IssueFilters } from "@/types";

interface IssueFilterBarProps {
  value: IssueFilters;
  /** Danh sách tài khoản có thể chọn để lọc theo người được giao. */
  assignees: string[];
  onChange: (value: IssueFilters) => void;
  onReset: () => void;
}

/** Thanh tìm kiếm + lọc theo nhãn + lọc theo người được giao (dùng cho Kanban và danh sách issue). */
export function IssueFilterBar({ value, assignees, onChange, onReset }: IssueFilterBarProps) {
  const labelOptions = [
    { value: ALL, label: "Tất cả nhãn" },
    ...STANDARD_LABELS.map((label) => ({ value: label.name, label: label.title })),
  ];
  const assigneeOptions = [
    { value: ALL, label: "Mọi người" },
    ...assignees.map((login) => ({ value: login, label: login })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-64">
        <Input
          aria-label="Tìm kiếm issue"
          placeholder="Tìm theo tiêu đề hoặc #số"
          value={value.search}
          onChange={(event) => onChange({ ...value, search: event.target.value })}
        />
      </div>
      <Select
        aria-label="Lọc theo nhãn"
        options={labelOptions}
        value={value.label}
        onChange={(event) => onChange({ ...value, label: event.target.value })}
      />
      <Select
        aria-label="Lọc theo người được giao"
        options={assigneeOptions}
        value={value.assignee}
        onChange={(event) => onChange({ ...value, assignee: event.target.value })}
      />
      <Button variant="ghost" size="sm" onClick={onReset}>
        Xóa lọc
      </Button>
    </div>
  );
}
