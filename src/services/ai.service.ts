import type { DuplicateCheckPayload, DuplicateCheckResult, WeeklySummary } from "@/types";
import { http } from "./http";

export const aiService = {
  /** Báo cáo tuần gần nhất. Backend trả 404 nếu chưa có báo cáo nào. */
  getLatestSummary: (repoId: number) =>
    http.get<WeeklySummary>(`/repositories/${repoId}/ai/weekly-summary`),

  /** Yêu cầu LLM tạo báo cáo tiến độ mới. */
  generateSummary: (repoId: number, weekStart?: string) =>
    http.post<WeeklySummary>(`/repositories/${repoId}/ai/weekly-summary`, { weekStart }),

  /** Kiểm tra issue sắp tạo có trùng với issue cũ không (embedding lọc, LLM xác nhận). */
  checkDuplicate: (repoId: number, payload: DuplicateCheckPayload) =>
    http.post<DuplicateCheckResult>(`/repositories/${repoId}/ai/duplicate-check`, payload),
};
