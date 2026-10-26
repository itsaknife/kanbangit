"use client";

import { Button, Card, ErrorMessage, Spinner } from "@/components/ui";
import { useRepoId, useRepository, useWeeklySummary } from "@/hooks";
import { formatDateRange, formatDateTime, getErrorMessage } from "@/utils";

/** Báo cáo tiến độ tuần do AI (LLM) viết từ dữ liệu issue của repository. */
export function WeeklySummaryPanel() {
  const repoId = useRepoId();
  const { summary, loading, error, generating, generateError, generate } = useWeeklySummary(repoId);
  const { repository } = useRepository(repoId);
  const canGenerate = repository?.canManage ?? false;

  let body;
  if (loading) {
    body = <Spinner />;
  } else if (error) {
    body = <ErrorMessage message={getErrorMessage(error)} />;
  } else if (summary) {
    body = <p className="whitespace-pre-wrap text-sm leading-6">{summary.content}</p>;
  } else {
    body = (
      <p className="text-sm text-zinc-500">
        {canGenerate
          ? 'Chưa có báo cáo nào. Bấm "Tạo báo cáo mới" để AI tổng hợp tiến độ của nhóm.'
          : "Chưa có báo cáo nào. Owner của repository sẽ tạo báo cáo."}
      </p>
    );
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Báo cáo tiến độ do AI viết</h3>
          {summary && (
            <p className="text-xs text-zinc-500">
              Tuần {formatDateRange(summary.weekStart, summary.weekEnd)} · tạo lúc{" "}
              {formatDateTime(summary.createdAt)}
            </p>
          )}
        </div>
        {canGenerate && (
          <Button size="sm" loading={generating} onClick={generate}>
            Tạo báo cáo mới
          </Button>
        )}
      </div>

      {body}
      {generateError && <ErrorMessage message={generateError} />}
    </Card>
  );
}
