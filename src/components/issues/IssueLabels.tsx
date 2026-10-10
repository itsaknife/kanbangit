import { Badge } from "@/components/ui";
import type { IssueLabel } from "@/types";

export function IssueLabels({ labels }: { labels: IssueLabel[] }) {
  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {labels.map((label) => (
        <Badge key={label.name} dotColor={label.color}>
          {label.name}
        </Badge>
      ))}
    </div>
  );
}
