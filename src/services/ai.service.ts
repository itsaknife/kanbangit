import type { DuplicateCheckPayload, DuplicateCheckResult, WeeklySummary } from "@/types";
import { http } from "./http";

export const aiService = {
  /** Báo cáo tuần gần nhất. Backend trả 404 nếu chưa có báo cáo nào. */
  getLatestSummary: (repoId: string) =>
    http.get<WeeklySummary>(`/projects/${repoId}/ai/weekly-summary`),

  /** Yêu cầu LLM tạo báo cáo tiến độ mới. */
  generateSummary: (repoId: string, weekStart?: string) =>
    http.post<WeeklySummary>(`/projects/${repoId}/ai/weekly-summary`, { weekStart }),

  /** Kiểm tra issue sắp tạo có trùng với issue cũ không (embedding lọc, LLM xác nhận). */
  checkDuplicate: (repoId: string, payload: DuplicateCheckPayload) =>
    http.post<DuplicateCheckResult>(`/projects/${repoId}/ai/duplicate-check`, payload),
};
