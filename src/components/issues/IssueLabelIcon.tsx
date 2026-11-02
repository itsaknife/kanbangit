import { Bug, CheckSquare, Sparkles } from "lucide-react";
import { cn } from "@/utils";
const colors: Record<string, string> = {
  bug: "text-red-500",
  enhancement: "text-cyan-500",
  task: "text-emerald-500",
};
export function IssueLabelIcon({ name }: { name: string }) {
  const className = cn("h-3.5 w-3.5", colors[name] ?? "text-muted-foreground");
  if (name === "bug") return <Bug className={className} aria-hidden="true" />;
  if (name === "enhancement") return <Sparkles className={className} aria-hidden="true" />;
  if (name === "task") return <CheckSquare className={className} aria-hidden="true" />;
  return null;
}
