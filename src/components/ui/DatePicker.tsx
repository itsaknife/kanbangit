"use client";

import { useId, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";
import { Calendar } from "./Calendar";
import { Button } from "./Button";
import { Input } from "./Input";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { fieldClassName, fieldLayoutClassName, type LabelLayout } from "./fieldStyles";
import { cn } from "@/utils";
import {
  formatCalendarValue,
  parseCalendarDate,
  replaceCalendarDay,
  replaceCalendarTime,
} from "@/utils/calendar";

interface DatePickerProps {
  id?: string;
  name?: string;
  label: string;
  labelLayout?: LabelLayout;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  appearance?: "field" | "pill" | "subtle";
}
function CalendarPicker({
  id,
  name,
  label,
  labelLayout = "vertical",
  value,
  onChange,
  min,
  max,
  disabled,
  required,
  placeholder,
  appearance = "field",
  withTime,
}: DatePickerProps & { withTime: boolean }) {
  const generatedId = useId();
  const controlId = id ?? name ?? generatedId;
  const [open, setOpen] = useState(false);
  const selected = parseCalendarDate(value);
  const minimum = parseCalendarDate(min);
  const maximum = parseCalendarDate(max);
  const display = formatCalendarValue(value, withTime);
  return (
    <div className={fieldLayoutClassName(appearance === "pill" ? "vertical" : labelLayout)}>
      <label
        htmlFor={controlId}
        className={appearance === "pill" ? "sr-only" : "text-sm font-medium"}
      >
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={controlId}
            type="button"
            disabled={disabled}
            aria-label={required ? label + " (bắt buộc)" : label}
            title={display || label}
            className={cn(
              appearance === "pill"
                ? "inline-flex h-8 max-w-[15rem] items-center gap-2 rounded-full border bg-muted/30 px-3 text-xs outline-none hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                : appearance === "subtle"
                  ? "flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border-0 bg-transparent px-2 text-left text-sm outline-none hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  : fieldClassName +
                    " min-w-0 items-center justify-between gap-2 text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            {appearance === "pill" && (
              <CalendarDays
                aria-hidden="true"
                className="size-3.5 shrink-0 text-muted-foreground"
              />
            )}
            <span className="truncate">
              {appearance === "pill"
                ? display
                  ? (placeholder || label) + " · " + display
                  : placeholder || label
                : display || placeholder || (withTime ? "Chọn ngày và giờ" : "Chọn ngày")}
            </span>
            {appearance !== "pill" && (
              <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-auto max-w-[calc(100vw-2rem)] p-0"
          aria-label={label}
        >
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? maximum ?? minimum}
            autoFocus
            disabled={[
              ...(minimum ? [{ before: minimum }] : []),
              ...(maximum ? [{ after: maximum }] : []),
            ]}
            onSelect={(date) => {
              if (!date) return;
              onChange(replaceCalendarDay(value, date, withTime));
              if (!withTime) setOpen(false);
            }}
          />
          {withTime && (
            <div className="space-y-2 border-t px-3 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="size-3.5" />
                Giờ Việt Nam · UTC+7
              </div>
              <Input
                id={controlId + "-time"}
                aria-label={"Giờ " + label.toLowerCase()}
                type="time"
                className="[color-scheme:light] dark:[color-scheme:dark]"
                step={
                  value.includes(".")
                    ? "0.001"
                    : (value.split("T")[1]?.length ?? 0) > 5
                      ? "1"
                      : "60"
                }
                value={value.split("T")[1] || "00:00"}
                disabled={!selected || disabled}
                min={min?.slice(0, 10) === value.slice(0, 10) ? min?.split("T")[1] : undefined}
                max={max?.slice(0, 10) === value.slice(0, 10) ? max?.split("T")[1] : undefined}
                onChange={(event) => onChange(replaceCalendarTime(value, event.target.value))}
              />
            </div>
          )}
          <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
            {!required ? (
              <Button
                size="sm"
                variant="ghost"
                disabled={!value || disabled}
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                Xóa ngày
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">Chọn ngày, sau đó chọn giờ</span>
            )}
            <Button
              size="sm"
              variant={withTime ? "primary" : "ghost"}
              onClick={() => setOpen(false)}
            >
              Xong
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
    </div>
  );
}
export function DatePicker(props: DatePickerProps) {
  return <CalendarPicker {...props} withTime={false} />;
}
export function DateTimePicker(props: DatePickerProps) {
  return <CalendarPicker {...props} withTime />;
}
