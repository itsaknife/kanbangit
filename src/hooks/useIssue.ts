"use client";

import { SOCKET_EVENTS } from "@/constants";
import { useIssuesStore } from "@/stores/issues.store";
import type { IssueEventPayload, IssueStatus, UpdateIssuePayload } from "@/types";
import { useAsync } from "./useAsync";
import { useRepoRoom } from "./useRepoRoom";
import { useSocketEvent } from "./useSocketEvent";

/** Chi tiết một issue, kèm thao tác chỉnh sửa và đổi trạng thái. */
export function useIssue(repoId: string, issueNumber: number) {
  const loadIssue = useIssuesStore((s) => s.loadIssue);
  const saveIssue = useIssuesStore((s) => s.updateIssue);
  const saveStatus = useIssuesStore((s) => s.updateStatus);
  const { data, loading, error, setData } = useAsync(
    () => loadIssue(repoId, issueNumber),
    [repoId, issueNumber],
  );

  useRepoRoom(repoId);
  useSocketEvent<IssueEventPayload>(SOCKET_EVENTS.issueUpdated, ({ repoId: id, issue }) => {
    if (id === repoId && issue.number === issueNumber) setData(() => issue);
  });

  const updateIssue = async (payload: UpdateIssuePayload) => {
    const updated = await saveIssue(repoId, issueNumber, payload);
    setData(() => updated);
  };

  const changeStatus = async (status: IssueStatus) => {
    const updated = await saveStatus(repoId, issueNumber, status);
    setData(() => updated);
  };

  return { issue: data, loading, error, updateIssue, changeStatus };
}
