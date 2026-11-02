import type { ReactNode } from "react";
import { cn } from "@/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 text-card-foreground shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
