"use client";

import { useParams } from "next/navigation";

/** Id repository lấy từ đường dẫn /repositories/[repoId]/... */
export function useRepoId(): number {
  const { repoId } = useParams<{ repoId: string }>();
  return Number(repoId);
}

/** Số issue lấy từ đường dẫn /repositories/[repoId]/issues/[issueNumber] */
export function useIssueNumber(): number {
  const { issueNumber } = useParams<{ issueNumber: string }>();
  return Number(issueNumber);
}
