import { Button, Input, Popover, PopoverContent, PopoverTrigger, Select } from "@/components/ui";
import { Filter } from "lucide-react";
import { ALL, STANDARD_LABELS } from "@/constants";
import type { IssueFilters } from "@/types";
import { IssueLabelIcon } from "./IssueLabelIcon";
import { DateRangePicker } from "@/components/dashboard";

interface IssueFilterBarProps {
  value: IssueFilters;
  /** Danh sách tài khoản có thể chọn để lọc theo người được giao. */
  assignees: string[];
  onChange: (value: IssueFilters) => void;
  onReset: () => void;
}

/** Thanh tìm kiếm + lọc theo nhãn + lọc theo người được giao (dùng cho Kanban và danh sách issue). */
export function IssueFilterBar({ value, assignees, onChange, onReset }: IssueFilterBarProps) {
  const activeFilterCount =
    Number(Boolean(value.search)) +
    Number(value.label !== ALL) +
    Number(value.assignee !== ALL) +
    Number(Boolean(value.dueFrom || value.dueTo));
  const labelOptions = [
    { value: ALL, label: "Tất cả nhãn" },
    ...STANDARD_LABELS.map((label) => ({
      value: label.name,
      label: label.title,
      icon: <IssueLabelIcon name={label.name} />,
    })),
  ];
  const assigneeOptions = [
    { value: ALL, label: "Tất cả người thực hiện" },
    ...assignees.map((login) => ({ value: login, label: login })),
  ];

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="relative h-10 w-10 rounded-xl p-0"
            title="Bộ lọc"
            aria-label="Mở bộ lọc"
          >
            <Filter className="h-5 w-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-semibold">Bộ lọc</h3>
            <Button variant="ghost" size="sm" onClick={onReset}>
              Xóa bộ lọc
            </Button>
          </div>
          <div className="flex flex-col gap-3 pt-3">
            <Input
              aria-label="Tìm kiếm issue"
              placeholder="Tìm theo tiêu đề hoặc #số"
              value={value.search}
              onChange={(event) => onChange({ ...value, search: event.target.value })}
            />
            <Select
              aria-label="Lọc theo nhãn"
              options={labelOptions}
              value={value.label}
              onChange={(nextValue) => onChange({ ...value, label: nextValue })}
            />
            <div className="border-t pt-3">
              <DateRangePicker
                startDate={value.dueFrom}
                endDate={value.dueTo}
                onChange={({ startDate, endDate }) =>
                  onChange({ ...value, dueFrom: startDate, dueTo: endDate })
                }
              />
            </div>
            <Select
              aria-label="Lọc theo người thực hiện"
              options={assigneeOptions}
              value={value.assignee}
              onChange={(nextValue) => onChange({ ...value, assignee: nextValue })}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
