"use client";

import { useMemo, useState } from "react";
import { EmptyState, ErrorMessage, Spinner } from "@/components/ui";
import { List } from "lucide-react";
import { useIssueFilters, useIssues, useRepoId } from "@/hooks";
import { filterIssues, getAssigneeLogins, getErrorMessage } from "@/utils";
import { CreateIssueModal } from "./CreateIssueModal";
import { CreateIssueButton } from "./CreateIssueButton";
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
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <List className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold">Danh sách issue</h1>
            <p className="text-sm text-muted-foreground">
              {visibleIssues.length} issue đang hiển thị
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IssueFilterBar
            value={filters}
            assignees={assignees}
            onChange={setFilters}
            onReset={resetFilters}
          />
          <CreateIssueButton onClick={() => setCreating(true)} />
        </div>
      </div>

      {visibleIssues.length === 0 ? (
        <EmptyState title="Không có issue nào" description="Thử đổi bộ lọc hoặc tạo issue mới." />
      ) : (
        <div className="flex flex-col gap-3">
          {visibleIssues.map((issue) => (
            <IssueItem key={issue.id} issue={issue} repoId={repoId} />
          ))}
        </div>
      )}
      <CreateIssueModal open={creating} onClose={() => setCreating(false)} onCreate={createIssue} />
    </section>
  );
}
