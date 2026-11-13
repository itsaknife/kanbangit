"use client";
import { SOCKET_EVENTS } from "@/constants";
import { useEffect } from "react";
import { useIssuesStore } from "@/stores";
import type { IssueDeletedPayload, IssueEventPayload } from "@/types";
import { useRepoRoom } from "./useRepoRoom";
import { useSocketEvent } from "./useSocketEvent";
export function useIssues(repoId: string) {
  const state = useIssuesStore((store) => store.byRepository[repoId]);
  const fetchIssues = useIssuesStore((store) => store.fetchIssues);
  const applyIssue = useIssuesStore((store) => store.applyIssue);
  const removeIssue = useIssuesStore((store) => store.removeIssue);
  const createIssue = useIssuesStore((store) => store.createIssue);
  const moveIssue = useIssuesStore((store) => store.moveIssue);
  useEffect(() => {
    if (!state || (!state.loaded && !state.loading && !state.error)) void fetchIssues(repoId);
  }, [state, repoId, fetchIssues]);
  useRepoRoom(repoId);
  useSocketEvent<IssueEventPayload>(SOCKET_EVENTS.issueCreated, ({ repoId: id, issue }) => {
    if (id === repoId) applyIssue(repoId, issue);
  });
  useSocketEvent<IssueEventPayload>(SOCKET_EVENTS.issueUpdated, ({ repoId: id, issue }) => {
    if (id === repoId) applyIssue(repoId, issue);
  });
  useSocketEvent<IssueDeletedPayload>(SOCKET_EVENTS.issueDeleted, ({ repoId: id, id: issueId }) => {
    if (id === repoId) removeIssue(repoId, issueId);
  });
  return {
    issues: state?.issues ?? [],
    loading: state?.loading ?? false,
    error: state?.error ?? null,
    reload: () => fetchIssues(repoId),
    createIssue: (payload: Parameters<typeof createIssue>[1]) => createIssue(repoId, payload),
    changeStatus: (issueId: string, status: Parameters<typeof moveIssue>[2]) =>
      moveIssue(repoId, issueId, status),
    isMoving: state?.isMoving ?? false,
    actionError: state?.actionError ?? null,
  };
}
