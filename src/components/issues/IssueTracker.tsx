"use client";

import { useEffect } from "react";
import { TrackerIcon } from "@/components/repositories/TrackerIcon";
import { useTrackersStore } from "@/stores/trackers.store";

export function IssueTracker({ repoId, trackerId }: { repoId: string; trackerId: string }) {
  const tracker = useTrackersStore((s) =>
    s.byRepository[repoId]?.items.find((t) => t.id === trackerId),
  );
  const fetch = useTrackersStore((s) => s.fetch);
  useEffect(() => {
    void fetch(repoId);
  }, [repoId, fetch]);
  if (!tracker) return null;
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-xs">
      <TrackerIcon tracker={tracker} className="h-3.5 w-3.5" />
      <span className="truncate">{tracker.name}</span>
    </span>
  );
}
