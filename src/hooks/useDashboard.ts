"use client";

import { useState } from "react";
import { SOCKET_EVENTS } from "@/constants";
import { dashboardService } from "@/services";
import { addWeeks, getWeekStart } from "@/utils";
import { useAsync } from "./useAsync";
import { useRepoRoom } from "./useRepoRoom";
import { useSocketEvent } from "./useSocketEvent";

/** Số liệu thống kê theo tuần, tự làm mới khi issue thay đổi. */
export function useDashboard(repoId: number) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const { data, loading, error, reload } = useAsync(
    () => dashboardService.getStats(repoId, weekStart),
    [repoId, weekStart],
  );

  useRepoRoom(repoId);
  useSocketEvent(SOCKET_EVENTS.issueCreated, reload);
  useSocketEvent(SOCKET_EVENTS.issueUpdated, reload);
  useSocketEvent(SOCKET_EVENTS.issueDeleted, reload);

  return {
    stats: data,
    loading,
    error,
    reload,
    goPrevWeek: () => setWeekStart((current) => addWeeks(current, -1)),
    goNextWeek: () => setWeekStart((current) => addWeeks(current, 1)),
    goCurrentWeek: () => setWeekStart(getWeekStart()),
  };
}
