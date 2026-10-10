"use client";

import { useMemo, useState } from "react";
import { Button, EmptyState, ErrorMessage, Spinner } from "@/components/ui";
import { useIssueFilters, useIssues, useRepoId } from "@/hooks";
import { filterIssues, getAssigneeLogins, getErrorMessage } from "@/utils";
import { CreateIssueModal } from "./CreateIssueModal";
import { IssueFilterBar } from "./IssueFilterBar";
import { IssueItem } from "./IssueItem";

export function IssueList() {
  const repoId = useRepoId();
  const { issues, loading, error, reload, createIssue } = useIssues(repoId);
  const { filters, appliedFilters, setFilters, resetFilters } = useIssueFilters();
  const [creating, setCreating] = useState(false);

  const assignees = useMemo(() => getAssigneeLogins(issues), [issues]);
  const visibleIssues = useMemo(
    () => filterIssues(issues, appliedFilters),
    [issues, appliedFilters],
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }
  if (error) return <ErrorMessage message={getErrorMessage(error)} onRetry={reload} />;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <IssueFilterBar
          value={filters}
          assignees={assignees}
          onChange={setFilters}
          onReset={resetFilters}
        />
        <Button onClick={() => setCreating(true)}>Tạo issue</Button>
      </div>

      {visibleIssues.length === 0 ? (
        <EmptyState title="Không có issue nào" description="Thử đổi bộ lọc hoặc tạo issue mới." />
      ) : (
        <div className="flex flex-col gap-2">
          {visibleIssues.map((issue) => (
            <IssueItem key={issue.number} issue={issue} repoId={repoId} />
          ))}
        </div>
      )}

      <CreateIssueModal open={creating} onClose={() => setCreating(false)} onCreate={createIssue} />
    </section>
  );
}
