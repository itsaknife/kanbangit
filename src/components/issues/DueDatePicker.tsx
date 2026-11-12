"use client";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { cn } from "@/utils";
const pad = (n: number) => String(n).padStart(2, "0");
const valueOf = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const dateOf = (value: string) => new Date(`${value}T12:00:00`);
export function DueDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"quick" | "calendar">("quick");
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(() => {
    const date = value ? dateOf(value) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return Array.from({ length: offset + count }, (_, index) =>
      index < offset ? null : new Date(month.getFullYear(), month.getMonth(), index - offset + 1),
    );
  }, [month]);
  const choose = (date: Date) => {
    onChange(valueOf(date));
    setOpen(false);
    setView("quick");
  };
  const quick = (daysFromToday: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    choose(date);
  };
  const label = value
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(dateOf(value))
    : "Đặt hạn hoàn thành";
  const quickMenu = (
    <div className="space-y-1">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start font-semibold"
        onClick={() => quick(0)}
      >
        Hôm nay
      </Button>
      <div className="border-t pt-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => setView("calendar")}
        >
          <CalendarDays className="h-4 w-4" />
          Tùy chọn...
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="relative w-full justify-start gap-2"
          onClick={() => quick(1)}
        >
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          Ngày mai
          <span className="ml-auto text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("vi-VN", {
              weekday: "short",
              day: "numeric",
              month: "numeric",
            }).format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1))}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="relative w-full justify-start gap-2"
          onClick={() => quick((7 - today.getDay() + 6) % 7)}
        >
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          Cuối tuần này
          <span className="ml-auto text-xs text-muted-foreground">CN</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="relative w-full justify-start gap-2"
          onClick={() => quick(7)}
        >
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          Sau một tuần
          <span className="ml-auto text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("vi-VN", {
              weekday: "short",
              day: "numeric",
              month: "numeric",
            }).format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7))}
          </span>
        </Button>
      </div>
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive"
          onClick={() => {
            onChange("");
            setOpen(false);
          }}
        >
          Xóa hạn
        </Button>
      )}
    </div>
  );
  const calendar = (
    <div>
      <div className="mb-2 flex items-center justify-between border-b pb-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">
          {new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(month)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
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
              onClick={() => choose(day)}
              className={cn(
                "h-9 rounded-md text-sm hover:bg-accent",
                valueOf(day) === value && "bg-primary text-primary-foreground",
              )}
            >
              {day.getDate()}
            </button>
          ) : (
            <span key={`empty-${index}`} />
          ),
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 w-full justify-start font-semibold"
        onClick={() => quick(0)}
      >
        Hôm nay
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="mt-1 w-full justify-start"
        onClick={() => setView("quick")}
      >
        ← Tùy chọn nhanh
      </Button>
    </div>
  );
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setView("quick");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          aria-label="Hạn hoàn thành"
          className="h-10 w-full justify-start font-normal shadow-sm"
        >
          <CalendarDays className="h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[18rem] p-2">
        {view === "quick" ? quickMenu : calendar}
      </PopoverContent>
    </Popover>
  );
}
