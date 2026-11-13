"use client";
import { useState } from "react";
import { useRepositoriesStore } from "@/stores";
import { Button, Modal, Spinner, ErrorMessage } from "@/components/ui";
import { getErrorMessage } from "@/utils";
export function ImportRepositoryDialog({
  initialOpen = false,
  hideTrigger = false,
  onClose,
}: { initialOpen?: boolean; hideTrigger?: boolean; onClose?: () => void } = {}) {
  const [open, setInternalOpen] = useState(initialOpen);
  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    if (!next) onClose?.();
  };
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const repos = useRepositoriesStore((s) => s.available);
  const importableRepos = repos.filter((repo) => repo.canManage);
  const loading = useRepositoriesStore((s) => s.discoveryLoading);
  const loadError = useRepositoriesStore((s) => s.discoveryError);
  const fetch = useRepositoriesStore((s) => s.fetchAvailable);
  const importRepo = useRepositoriesStore((s) => s.importRepository);
  const reload = useRepositoriesStore((s) => s.fetchRepositories);
  const connect = async (id: string) => {
    setPending(id);
    setError(null);
    try {
      await importRepo(id);
      setOpen(false);
    } catch (error) {
      setError(getErrorMessage(error));
      await reload(true);
    } finally {
      setPending(null);
    }
  };
  return (
    <>
      {!hideTrigger && (
        <Button
          variant="secondary"
          onClick={() => {
            setOpen(true);
            setError(null);
            void fetch();
          }}
        >
          Import từ GitHub
        </Button>
      )}
      <Modal
        open={open}
        title="Import repository GitHub cá nhân"
        onClose={() => {
          if (!pending) setOpen(false);
        }}
      >
        {loading && <Spinner />}
        {loadError && <ErrorMessage message={loadError} onRetry={fetch} />}
        {error && <ErrorMessage message={error} />}
        {!loading && !loadError && !importableRepos.length && (
          <p>Không có repository mới đủ quyền để import.</p>
        )}
        <ul className="space-y-3">
          {importableRepos.map((repo) => (
            <li
              className="flex flex-wrap items-center justify-between gap-3 border-b py-3"
              key={repo.githubId}
            >
              <span>
                {repo.fullName} · {repo.isPrivate ? "Private" : "Public"}
              </span>
              <Button
                size="sm"
                disabled={!repo.canManage || pending !== null}
                loading={pending === repo.githubId}
                onClick={() => void connect(repo.githubId)}
              >
                Import
              </Button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          Cần quyền quản trị GitHub để đăng ký webhook.
        </p>
      </Modal>
    </>
  );
}
