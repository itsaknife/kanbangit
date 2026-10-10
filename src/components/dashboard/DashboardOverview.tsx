"use client";

import { WeeklySummaryPanel } from "@/components/ai";
import { Button, ErrorMessage, Spinner } from "@/components/ui";
import { useDashboard, useRepoId } from "@/hooks";
import { formatDateRange, getErrorMessage } from "@/utils";
import { MemberWorkloadChart } from "./MemberWorkloadChart";
import { StatCard } from "./StatCard";
import { WeeklyClosedChart } from "./WeeklyClosedChart";

export function DashboardOverview() {
  const repoId = useRepoId();
  const { stats, loading, error, reload, goPrevWeek, goNextWeek, goCurrentWeek } =
    useDashboard(repoId);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }
  if (error || !stats) {
    return <ErrorMessage message={getErrorMessage(error)} onRetry={reload} />;
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          Tuần {formatDateRange(stats.weekStart, stats.weekEnd)}
        </h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={goPrevWeek}>
            ← Tuần trước
          </Button>
          <Button variant="secondary" size="sm" onClick={goCurrentWeek}>
            Tuần này
          </Button>
          <Button variant="secondary" size="sm" onClick={goNextWeek}>
            Tuần sau →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Tổng số issue" value={stats.totalIssues} />
        <StatCard label="Cần làm" value={stats.todo} />
        <StatCard label="Đang làm" value={stats.inProgress} />
        <StatCard label="Hoàn thành" value={stats.done} />
        <StatCard label="Đóng trong tuần" value={stats.closedThisWeek} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WeeklyClosedChart data={stats.dailyClosed} />
        <MemberWorkloadChart data={stats.members} />
      </div>

      <WeeklySummaryPanel />
    </section>
  );
}
