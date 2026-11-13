"use client";
import { useEffect } from "react";
import { useAssigneesStore } from "@/stores/assignees.store";
export function useAssignees(repoId: string) {
  const state = useAssigneesStore((s) => s.byRepository[repoId]);
  const fetch = useAssigneesStore((s) => s.fetch);
  useEffect(() => {
    void fetch(repoId);
  }, [repoId, fetch]);
  return {
    assignees: state?.items ?? [],
    loading: state?.loading ?? true,
    error: state?.error,
    reload: () => fetch(repoId),
  };
}
