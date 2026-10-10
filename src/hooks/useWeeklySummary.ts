"use client";

import { useState } from "react";
import { aiService, ApiError } from "@/services";
import type { WeeklySummary } from "@/types";
import { getErrorMessage } from "@/utils";
import { useAsync } from "./useAsync";

async function fetchLatestSummary(repoId: number): Promise<WeeklySummary | null> {
  try {
    return await aiService.getLatestSummary(repoId);
  } catch (error) {
    // 404 nghĩa là chưa có báo cáo nào, không phải lỗi
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Báo cáo tiến độ tuần do AI viết: xem báo cáo gần nhất và yêu cầu tạo báo cáo mới. */
export function useWeeklySummary(repoId: number) {
  const { data, loading, error, setData } = useAsync(() => fetchLatestSummary(repoId), [repoId]);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const generate = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const summary = await aiService.generateSummary(repoId);
      setData(() => summary);
    } catch (err) {
      setGenerateError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  return { summary: data ?? null, loading, error, generating, generateError, generate };
}
