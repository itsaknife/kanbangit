import { Bug, CircleCheck, FileSearch, Layers, Rocket, Sparkles, WandSparkles } from "lucide-react";
import type { Tracker } from "@/types/tracker.types";
import { cn } from "@/utils";

const icons = {
  BUG: Bug,
  FEAT: Sparkles,
  TASK: CircleCheck,
  ENH: WandSparkles,
  SPEC: FileSearch,
  REL: Rocket,
};

const names: Record<string, keyof typeof icons> = {
  bug: "BUG",
  feature: "FEAT",
  task: "TASK",
  enhancement: "ENH",
  "spec analytics": "SPEC",
  release: "REL",
};

export function TrackerIcon({
  tracker,
  className,
}: {
  tracker: Pick<Tracker, "name" | "prefix" | "color">;
  className?: string;
}) {
  const key = names[tracker.name.toLowerCase()] ?? tracker.prefix.toUpperCase();
  const Icon = icons[key as keyof typeof icons] ?? Layers;
  return (
    <Icon
      aria-hidden="true"
      className={cn("h-4 w-4 shrink-0", className)}
      style={{ color: tracker.color }}
    />
  );
}
