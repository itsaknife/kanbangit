"use client";

import { useState } from "react";
import { SOCKET_EVENTS } from "@/constants";
import { issueService } from "@/services";
import type {
  CreateIssuePayload,
  Issue,
  IssueDeletedPayload,
  IssueEventPayload,
  IssueStatus,
} from "@/types";
import { getErrorMessage, removeIssue, upsertIssue } from "@/utils";
import { useAsync } from "./useAsync";
import { useRepoRoom } from "./useRepoRoom";
import { useSocketEvent } from "./useSocketEvent";

/** Danh sách issue của một repository, tự cập nhật realtime qua Socket.io. */
export function useIssues(repoId: number) {
  const { data, loading, error, reload, setData } = useAsync(
    () => issueService.list(repoId),
    [repoId],
  );
  const [actionError, setActionError] = useState<string | null>(null);

  useRepoRoom(repoId);

  const applyIssueEvent = ({ repoId: eventRepoId, issue }: IssueEventPayload) => {
    if (eventRepoId === repoId) setData((list) => upsertIssue(list ?? [], issue));
  };
  useSocketEvent<IssueEventPayload>(SOCKET_EVENTS.issueCreated, applyIssueEvent);
  useSocketEvent<IssueEventPayload>(SOCKET_EVENTS.issueUpdated, applyIssueEvent);
  useSocketEvent<IssueDeletedPayload>(SOCKET_EVENTS.issueDeleted, (payload) => {
    if (payload.repoId === repoId) setData((list) => removeIssue(list ?? [], payload.number));
  });

  const createIssue = async (payload: CreateIssuePayload): Promise<Issue> => {
    const issue = await issueService.create(repoId, payload);
    setData((list) => upsertIssue(list ?? [], issue));
    return issue;
  };

  /** Đổi cột của issue: cập nhật giao diện ngay, nếu server báo lỗi thì trả về trạng thái cũ. */
  const changeStatus = async (issueNumber: number, status: IssueStatus) => {
    const previous = data?.find((issue) => issue.number === issueNumber);
    if (!previous || previous.status === status) return;

    setActionError(null);
    setData((list) =>
      list?.map((issue) => (issue.number === issueNumber ? { ...issue, status } : issue)),
    );

    try {
      const updated = await issueService.updateStatus(repoId, issueNumber, status);
      setData((list) => upsertIssue(list ?? [], updated));
    } catch (err) {
      setData((list) => list?.map((issue) => (issue.number === issueNumber ? previous : issue)));
      setActionError(getErrorMessage(err));
    }
  };

  return { issues: data ?? [], loading, error, reload, createIssue, changeStatus, actionError };
}
