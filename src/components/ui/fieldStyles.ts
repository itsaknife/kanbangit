/** Class dùng chung cho các ô nhập liệu (Input, Textarea, Select). */
export const fieldClassName =
  "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none " +
  "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export type LabelLayout = "vertical" | "horizontal";
export const fieldLayoutClassName = (layout: LabelLayout = "vertical") =>
  layout === "horizontal"
    ? "grid min-w-0 grid-cols-1 items-center gap-x-4 gap-y-2 sm:grid-cols-[8rem_minmax(0,1fr)]"
    : "flex min-w-0 flex-col gap-1";
