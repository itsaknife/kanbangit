"use client";

import { Button, Input, Popover, PopoverContent, PopoverTrigger, Select } from "@/components/ui";
import { Filter } from "lucide-react";
import { useEffect } from "react";
import { ALL, BOARD_COLUMNS } from "@/constants";
import { useRepoId } from "@/hooks";
import { useTrackersStore } from "@/stores/trackers.store";
import { TrackerIcon } from "@/components/repositories/TrackerIcon";
import type { IssueFilters } from "@/types";
import { DateRangePicker } from "@/components/dashboard";

interface IssueFilterBarProps {
  value: IssueFilters;
  /** Danh sách tài khoản có thể chọn để lọc theo người được giao. */
  assignees: string[];
  onChange: (value: IssueFilters) => void;
  onReset: () => void;
}

/** Bộ lọc dùng chung cho Kanban và danh sách issue. */
export function IssueFilterBar({ value, assignees, onChange, onReset }: IssueFilterBarProps) {
  const repoId = useRepoId();
  const trackerState = useTrackersStore((s) => s.byRepository[repoId]);
  const fetchTrackers = useTrackersStore((s) => s.fetch);
  useEffect(() => {
    void fetchTrackers(repoId);
  }, [repoId, fetchTrackers]);
  const activeFilterCount =
    Number(Boolean(value.search)) +
    Number(value.trackerId !== ALL) +
    Number(value.status !== ALL) +
    Number(value.assignee !== ALL) +
    Number(Boolean(value.dueFrom || value.dueTo));
  const trackerOptions = [
    { value: ALL, label: "Tất cả tracker" },
    ...(trackerState?.items ?? []).map((tracker) => ({
      value: tracker.id,
      label: tracker.name + (tracker.isActive ? "" : " (Đã vô hiệu hóa)"),
      icon: <TrackerIcon tracker={tracker} />,
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
              placeholder="Tìm mã, tiêu đề, mô tả hoặc #số"
              value={value.search}
              onChange={(event) => onChange({ ...value, search: event.target.value })}
            />
            <Select
              label="Trạng thái"
              aria-label="Lọc theo trạng thái"
              value={value.status}
              options={[
                { value: ALL, label: "Tất cả trạng thái" },
                ...BOARD_COLUMNS.map((column) => ({ value: column.status, label: column.title })),
              ]}
              onChange={(nextValue) =>
                onChange({
                  ...value,
                  status:
                    BOARD_COLUMNS.find((column) => column.status === nextValue)?.status ?? ALL,
                })
              }
            />
            <Select
              label="Tracker"
              aria-label="Lọc theo tracker"
              options={trackerOptions}
              value={value.trackerId}
              onChange={(nextValue) => onChange({ ...value, trackerId: nextValue })}
            />
            {trackerState?.error && (
              <p role="alert" className="text-xs text-destructive">
                {trackerState.error}
              </p>
            )}
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
              label="Người thực hiện"
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
