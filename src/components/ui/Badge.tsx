import type { ReactNode } from "react";
import { cn } from "@/utils";

interface BadgeProps {
  children: ReactNode;
  /** Mã màu hex không có dấu #, hiển thị thành chấm tròn bên trái (dùng cho nhãn GitHub). */
  dotColor?: string;
  icon?: ReactNode;
  className?: string;
}

export function Badge({ children, dotColor, icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-secondary px-2 py-0.5",
        "text-xs font-medium text-secondary-foreground",
        className,
      )}
    >
      {icon}
      {dotColor && !icon && (
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: `#${dotColor}` }}
        />
      )}
      {children}
    </span>
  );
}
