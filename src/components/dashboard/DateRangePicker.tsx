"use client";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { cn } from "@/utils";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
}
const pad = (value: number) => String(value).padStart(2, "0");
const toDate = (value: string) => new Date(`${value}T12:00:00`);
const toValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const format = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    toDate(value),
  );

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => {
    const date = startDate ? toDate(startDate) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);
  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return Array.from({ length: offset + count }, (_, index) =>
      index < offset ? null : new Date(cursor.getFullYear(), cursor.getMonth(), index - offset + 1),
    );
  }, [cursor]);
  const choose = (value: string) => {
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(value);
      setDraftEnd("");
      return;
    }
    const range =
      value < draftStart
        ? { startDate: value, endDate: draftStart }
        : { startDate: draftStart, endDate: value };
    setDraftStart(range.startDate);
    setDraftEnd(range.endDate);
    onChange(range);
    setOpen(false);
  };
  const shift = (amount: number) =>
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setDraftStart(startDate);
          setDraftEnd(endDate);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" className="h-10 gap-2">
          <CalendarDays className="h-4 w-4" />
          {startDate && endDate ? `${format(startDate)} – ${format(endDate)}` : "Hạn hoàn thành"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[21rem] p-3">
        <div className="mb-3 flex items-center justify-between border-b pb-3">
          <span className="text-sm font-semibold">Khoảng thời gian</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const today = new Date();
              const value = toValue(today);
              setDraftStart(value);
              setDraftEnd(value);
              onChange({ startDate: value, endDate: value });
            }}
          >
            Hôm nay
          </Button>
        </div>
        <div className="flex items-center justify-between pb-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => shift(-1)}
            aria-label="Tháng trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold">
            {new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(cursor)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => shift(1)}
            aria-label="Tháng sau"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
            <span key={day} className="py-1">
              {day}
            </span>
          ))}
          {days.map((day, index) =>
            day ? (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => choose(toValue(day))}
                className={cn(
                  "h-9 rounded-md text-sm hover:bg-accent",
                  (toValue(day) === draftStart || toValue(day) === draftEnd) &&
                    "bg-primary text-primary-foreground",
                  draftStart &&
                    draftEnd &&
                    toValue(day) > draftStart &&
                    toValue(day) < draftEnd &&
                    "bg-accent",
                )}
              >
                {day.getDate()}
              </button>
            ) : (
              <span key={`empty-${index}`} />
            ),
          )}
        </div>
        <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
          {draftEnd
            ? `${format(draftStart)} – ${format(draftEnd)}`
            : "Chọn ngày bắt đầu và ngày kết thúc"}
        </p>
      </PopoverContent>
    </Popover>
  );
}
