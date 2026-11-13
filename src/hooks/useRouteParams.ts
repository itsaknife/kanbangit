"use client";

import { useParams } from "next/navigation";

/** Id repository lấy từ đường dẫn /repositories/[repoId]/... */
export function useRepoId(): string {
  const { repoId } = useParams<{ repoId: string }>();
  return repoId;
}

/** UUID issue lấy từ đường dẫn /repositories/[repoId]/issues/[issueNumber] */
export function useIssueId(): string {
  const { issueNumber } = useParams<{ issueNumber: string }>();
  return issueNumber;
}
