"use client";

import { useState } from "react";
import { aiService } from "@/services";
import type { DuplicateCheckPayload, DuplicateCheckResult } from "@/types";

/** Kiểm tra issue sắp tạo có trùng với issue cũ không (do AI nhận định). */
export function useDuplicateCheck(repoId: number) {
  const [result, setResult] = useState<DuplicateCheckResult | null>(null);
  const [checking, setChecking] = useState(false);

  /** Trả về kết quả, hoặc null nếu kiểm tra lỗi (khi đó không chặn người dùng tạo issue). */
  const check = async (payload: DuplicateCheckPayload): Promise<DuplicateCheckResult | null> => {
    setChecking(true);
    try {
      const response = await aiService.checkDuplicate(repoId, payload);
      setResult(response);
      return response;
    } catch {
      setResult(null);
      return null;
    } finally {
      setChecking(false);
    }
  };

  const reset = () => setResult(null);

  return { result, checking, check, reset };
}
