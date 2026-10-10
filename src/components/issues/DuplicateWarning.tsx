"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useRepoId } from "@/hooks";
import type { DuplicateCandidate } from "@/types";

interface DuplicateWarningProps {
  candidates: DuplicateCandidate[];
  submitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

/** Cảnh báo khi AI cho rằng issue sắp tạo có thể trùng với issue đã có. */
export function DuplicateWarning({
  candidates,
  submitting,
  onConfirm,
  onBack,
}: DuplicateWarningProps) {
  const repoId = useRepoId();

  return (
    <div
      role="alert"
      className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-950/40"
    >
      <p className="font-medium">AI cho rằng issue này có thể trùng với issue đã có:</p>
      <ul className="mt-2 flex flex-col gap-2">
        {candidates.map((candidate) => (
          <li key={candidate.issueNumber}>
            <Link
              href={ROUTES.issueDetail(repoId, candidate.issueNumber)}
              target="_blank"
              className="font-medium text-blue-600 hover:underline"
            >
              #{candidate.issueNumber} {candidate.title}
            </Link>
            <p className="text-zinc-600 dark:text-zinc-400">{candidate.reason}</p>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="secondary" onClick={onBack}>
          Quay lại sửa
        </Button>
        <Button size="sm" loading={submitting} onClick={onConfirm}>
          Vẫn tạo issue
        </Button>
      </div>
    </div>
  );
}
