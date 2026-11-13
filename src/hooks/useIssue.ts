"use client";

import { SOCKET_EVENTS } from "@/constants";
import { useIssuesStore } from "@/stores/issues.store";
import type { IssueEventPayload, IssueStatus, UpdateIssuePayload } from "@/types";
import { useAsync } from "./useAsync";
import { useRepoRoom } from "./useRepoRoom";
import { useSocketEvent } from "./useSocketEvent";

/** Chi tiết một issue, kèm thao tác chỉnh sửa và đổi trạng thái. */
export function useIssue(repoId: string, issueId: string) {
  const loadIssue = useIssuesStore((s) => s.loadIssue);
  const saveIssue = useIssuesStore((s) => s.updateIssue);
  const saveStatus = useIssuesStore((s) => s.updateStatus);
  const { data, loading, error, reload } = useAsync(
    () => loadIssue(repoId, issueId),
    [repoId, issueId],
  );

  const storedIssue = useIssuesStore((s) =>
    s.byRepository[repoId]?.issues.find((issue) => issue.id === issueId),
  );
  const applyIssue = useIssuesStore((s) => s.applyIssue);
  useRepoRoom(repoId);
  useSocketEvent<IssueEventPayload>(SOCKET_EVENTS.issueUpdated, ({ repoId: id, issue }) => {
    if (id !== repoId) return;
    applyIssue(repoId, issue);
    if (issue.id !== issueId) reload();
  });
  useSocketEvent<IssueEventPayload>(SOCKET_EVENTS.issueCreated, ({ repoId: id, issue }) => {
    if (id !== repoId) return;
    applyIssue(repoId, issue);
    reload();
  });

  const updateIssue = async (payload: UpdateIssuePayload) => {
    await saveIssue(repoId, issueId, payload);
  };

  const changeStatus = async (status: IssueStatus) => {
    await saveStatus(repoId, issueId, status);
  };

  return { issue: storedIssue ?? data, loading, error, reload, updateIssue, changeStatus };
}
