"use client";
import { useEffect, useState } from "react";
import { useRepoId } from "@/hooks";
import { useMembersStore } from "@/stores/members.store";
import { Avatar, Button, ErrorMessage, Spinner, Modal } from "@/components/ui";
export function RepositoryMembers() {
  const id = useRepoId();
  const state = useMembersStore((s) => s.byRepository[id]);
  const fetch = useMembersStore((s) => s.fetch);
  const sync = useMembersStore((s) => s.sync);
  const transfer = useMembersStore((s) => s.transfer);
  const [target, setTarget] = useState<{ id: string; login: string } | null>(null);
  useEffect(() => {
    void fetch(id);
  }, [id, fetch]);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Repository members</h1>
      {state?.canManage && (
        <Button loading={state.busy} onClick={() => void sync(id)}>
          Đồng bộ từ GitHub
        </Button>
      )}
      {state?.loading && <Spinner />}
      {state?.error && <ErrorMessage message={state.error} onRetry={() => fetch(id)} />}
      <ul className="space-y-3">
        {state?.members.map((member) => (
          <li
            className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"
            key={member.id}
          >
            <div className="flex items-center gap-2">
              {member.avatarUrl && <Avatar src={member.avatarUrl} alt={member.login} />}
              <span>
                {member.login} · {member.role} · GitHub: {member.githubPermission}
                {!member.isActive ? " · Không còn hoạt động" : ""}
                {!member.userId ? " · Chưa đăng nhập KanbanGit" : ""}
              </span>
            </div>
            {state.canManage && member.isActive && member.userId && member.role !== "OWNER" && (
              <Button
                size="sm"
                variant="secondary"
                disabled={state.busy}
                onClick={() => setTarget({ id: member.id, login: member.login })}
              >
                Chuyển quyền Owner
              </Button>
            )}
          </li>
        ))}
      </ul>
      <Modal
        open={target !== null}
        title="Chuyển quyền Owner"
        onClose={() => {
          if (!state?.busy) setTarget(null);
        }}
      >
        <p>Bạn sẽ trở thành Member và trao quyền quản lý repository cho {target?.login}.</p>
        {state?.error && <ErrorMessage message={state.error} />}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" disabled={state?.busy} onClick={() => setTarget(null)}>
            Hủy
          </Button>
          <Button
            loading={state?.busy}
            onClick={async () => {
              if (target) {
                if (await transfer(id, target.id)) setTarget(null);
              }
            }}
          >
            Xác nhận chuyển quyền
          </Button>
        </div>
      </Modal>
    </div>
  );
}
