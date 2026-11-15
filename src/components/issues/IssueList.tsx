"use client";

import { useMemo, useState } from "react";
import { EmptyState, ErrorMessage, Spinner } from "@/components/ui";
import { createPortal } from "react-dom";
import { useRepositoryToolbar } from "@/components/layout/RepositoryWorkspace";
import { useIssueFilters, useIssues, useRepoId } from "@/hooks";
import { filterIssues, getAssigneeLogins, getErrorMessage } from "@/utils";
import { CreateIssueModal } from "./CreateIssueModal";
import { CreateIssueButton } from "./CreateIssueButton";
import { IssueFilterBar } from "./IssueFilterBar";
import { IssueItem } from "./IssueItem";

export function IssueList() {
  const toolbar = useRepositoryToolbar();
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
    <section aria-label="Danh sách issue" className="flex flex-col gap-3">
      {toolbar &&
        createPortal(
          <>
            <IssueFilterBar
              value={filters}
              assignees={assignees}
              onChange={setFilters}
              onReset={resetFilters}
            />
            <CreateIssueButton onClick={() => setCreating(true)} />
          </>,
          toolbar,
        )}

      {visibleIssues.length === 0 ? (
        <EmptyState title="Không có issue nào" description="Thử đổi bộ lọc hoặc tạo issue mới." />
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card divide-y">
          {visibleIssues.map((issue) => (
            <IssueItem key={issue.id} issue={issue} repoId={repoId} />
          ))}
        </div>
      )}
      <CreateIssueModal open={creating} onClose={() => setCreating(false)} onCreate={createIssue} />
    </section>
  );
}
