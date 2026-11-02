import { Badge } from "@/components/ui";
import type { IssueLabel } from "@/types";
import { IssueLabelIcon } from "./IssueLabelIcon";

export function IssueLabels({ labels }: { labels: IssueLabel[] }) {
  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {labels.map((label) => (
        <Badge key={label.name} icon={<IssueLabelIcon name={label.name} />}>
          {label.name}
        </Badge>
      ))}
    </div>
  );
}
