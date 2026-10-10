import type { DashboardStats } from "@/types";
import { http } from "./http";

export const dashboardService = {
  /** Thống kê của một tuần. `weekStart` là ngày thứ Hai (yyyy-MM-dd), bỏ trống = tuần này. */
  getStats: (repoId: number, weekStart?: string) =>
    http.get<DashboardStats>(`/repositories/${repoId}/dashboard`, { weekStart }),
};
