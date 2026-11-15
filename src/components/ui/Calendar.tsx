"use client";

import { DayPicker } from "react-day-picker";
import { vi } from "react-day-picker/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/utils";

/** shadcn-style calendar using the app's existing tokens and DayPicker keyboard behavior. */
export function Calendar({
  className,
  classNames,
  components,
  ...props
}: ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={vi}
      weekStartsOn={1}
      showOutsideDays
      labels={{ labelPrevious: () => "Tháng trước", labelNext: () => "Tháng sau" }}
      className={cn("relative w-fit p-3", className)}
      classNames={{
        months: "flex flex-col gap-4",
        month: "w-full space-y-3",
        month_caption: "flex h-8 items-center justify-center px-9",
        caption_label: "text-sm font-medium capitalize",
        nav: "absolute inset-x-3 top-3 flex items-center justify-between",
        button_previous:
          "inline-flex size-8 items-center justify-center rounded-md border bg-background hover:bg-accent disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        button_next:
          "inline-flex size-8 items-center justify-center rounded-md border bg-background hover:bg-accent disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-center text-[11px] font-normal text-muted-foreground",
        weeks: "block",
        week: "mt-1 flex",
        day: "relative size-9 p-0 text-center text-sm",
        day_button:
          "inline-flex size-9 items-center justify-center rounded-md font-normal outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none",
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90",
        today:
          "[&:not([data-selected])>button]:bg-accent [&:not([data-selected])>button]:font-semibold",
        outside: "text-muted-foreground opacity-50",
        disabled: "opacity-30",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
        ...components,
      }}
      {...props}
    />
  );
}
