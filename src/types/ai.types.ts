export interface WeeklySummary {
  id: string;
  weekStart: string;
  weekEnd: string;
  /** Đoạn báo cáo do LLM viết. */
  content: string;
  createdAt: string;
}

export interface DuplicateCheckPayload {
  title: string;
  body?: string;
}

export interface DuplicateCandidate {
  issueId: string;
  issueNumber: number | null;
  title: string;
  /** Lý do LLM cho rằng hai issue có thể trùng nhau. */
  reason: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  candidates: DuplicateCandidate[];
}
