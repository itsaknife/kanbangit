"use client";

import { SOCKET_EVENTS } from "@/constants";
import { issueService } from "@/services";
import type { IssueEventPayload, IssueStatus, UpdateIssuePayload } from "@/types";
import { useAsync } from "./useAsync";
import { useRepoRoom } from "./useRepoRoom";
import { useSocketEvent } from "./useSocketEvent";

/** Chi tiết một issue, kèm thao tác chỉnh sửa và đổi trạng thái. */
export function useIssue(repoId: number, issueNumber: number) {
  const { data, loading, error, setData } = useAsync(
    () => issueService.getByNumber(repoId, issueNumber),
    [repoId, issueNumber],
  );

  useRepoRoom(repoId);
  useSocketEvent<IssueEventPayload>(SOCKET_EVENTS.issueUpdated, ({ repoId: id, issue }) => {
    if (id === repoId && issue.number === issueNumber) setData(() => issue);
  });

  const updateIssue = async (payload: UpdateIssuePayload) => {
    const updated = await issueService.update(repoId, issueNumber, payload);
    setData(() => updated);
  };

  const changeStatus = async (status: IssueStatus) => {
    const updated = await issueService.updateStatus(repoId, issueNumber, status);
    setData(() => updated);
  };

  return { issue: data, loading, error, updateIssue, changeStatus };
}
