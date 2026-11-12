"use client";

import { useState } from "react";
import { EmptyState, ErrorMessage, Spinner } from "@/components/ui";
import { useRepositories } from "@/hooks";
import { getErrorMessage } from "@/utils";
import { RepositoryCard } from "./RepositoryCard";
import { CreateRepositoryForm } from "./CreateRepositoryForm";
import { ImportRepositoryDialog } from "./ImportRepositoryDialog";

export function RepositoryList() {
  const { repositories, loading, error, reload, connect } = useRepositories();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

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
        <CreateRepositoryForm />
        <ImportRepositoryDialog />
        <ErrorMessage message={getErrorMessage(error)} onRetry={reload} />
      </>
    );
  if (repositories.length === 0) {
    return (
      <>
        <CreateRepositoryForm />
        <ImportRepositoryDialog />
        <EmptyState
          title="Chưa có repository nào"
          description="Tài khoản GitHub của bạn chưa có repository nào để kết nối."
        />
      </>
    );
  }

  // Repository đã kết nối hiển thị trước
  const sorted = [...repositories].sort((a, b) => Number(b.isConnected) - Number(a.isConnected));

  return (
    <div className="flex flex-col gap-3">
      <CreateRepositoryForm />
      <ImportRepositoryDialog />
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
