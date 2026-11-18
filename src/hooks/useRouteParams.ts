"use client";

import { useParams } from "next/navigation";

/** Id repository lấy từ đường dẫn /projects/[repoId]/... */
export function useRepoId(): string {
  const { repoId } = useParams<{ repoId: string }>();
  return repoId;
}

/** UUID issue lấy từ đường dẫn /projects/[repoId]/issues/[issueNumber] */
export function useIssueId(): string {
  const { issueNumber } = useParams<{ issueNumber: string }>();
  return issueNumber;
}
