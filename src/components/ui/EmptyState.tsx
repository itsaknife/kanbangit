import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-700">
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm text-zinc-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
