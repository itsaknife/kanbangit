"use client";

import { useMemo } from "react";
import { filterIssues, getAssigneeLogins, groupIssuesByStatus } from "@/utils";
import { useIssueFilters } from "./useIssueFilters";
import { useIssues } from "./useIssues";
import { useRepoId } from "./useRouteParams";

/** Toàn bộ dữ liệu và thao tác cho bảng Kanban: lọc, chia cột, kéo-thả đổi trạng thái. */
export function useBoard() {
  const repoId = useRepoId();
  const { issues, loading, error, reload, createIssue, changeStatus, actionError } =
    useIssues(repoId);
  const { filters, appliedFilters, setFilters, resetFilters } = useIssueFilters();

  const assignees = useMemo(() => getAssigneeLogins(issues), [issues]);
  const columns = useMemo(
    () => groupIssuesByStatus(filterIssues(issues, appliedFilters)),
    [issues, appliedFilters],
  );

  return {
    columns,
    assignees,
    filters,
    setFilters,
    resetFilters,
    loading,
    error,
    reload,
    createIssue,
    moveIssue: changeStatus,
    actionError,
  };
}
