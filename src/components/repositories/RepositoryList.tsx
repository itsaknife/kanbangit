"use client";

import { useAuth } from "@/hooks";
import { useState } from "react";
import { EmptyState, ErrorMessage, Spinner } from "@/components/ui";
import { useRepositories } from "@/hooks";
import { getErrorMessage } from "@/utils";
import { RepositoryCard } from "./RepositoryCard";
import { CreateRepositoryForm } from "./CreateRepositoryForm";
import { ImportRepositoryDialog } from "./ImportRepositoryDialog";

export function RepositoryList() {
  const { user } = useAuth();
  const githubLinked = !!user?.identities?.some((i) => i.provider === "GITHUB");
  const { repositories, loading, error, reload, connect } = useRepositories();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const actions = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {githubLinked && <ImportRepositoryDialog />}
      <CreateRepositoryForm />
    </div>
  );

  const handleConnect = async (repoId: string) => {
    setConnectingId(repoId);
    setConnectError(null);
    try {
      await connect(repoId);
    } catch (err) {
      setConnectError(getErrorMessage(err));
    } finally {
      setConnectingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }
  if (error)
    return (
      <>
        {actions}
        <ErrorMessage message={getErrorMessage(error)} onRetry={reload} />
      </>
    );
  if (repositories.length === 0) {
    return (
      <>
        {actions}
        <EmptyState
          title="Chưa có Project nào"
          description="Tạo Project KanbanGit hoặc kết nối repository GitHub để bắt đầu."
        />
      </>
    );
  }

  // Repository đã kết nối hiển thị trước
  const sorted = [...repositories].sort((a, b) => Number(b.isConnected) - Number(a.isConnected));

  return (
    <div className="flex flex-col gap-3">
      {actions}
      {connectError && <ErrorMessage message={connectError} />}
      {sorted.map((repository) => (
        <RepositoryCard
          key={repository.id}
          repository={repository}
          connecting={connectingId === repository.id}
          onConnect={handleConnect}
        />
      ))}
    </div>
  );
}
