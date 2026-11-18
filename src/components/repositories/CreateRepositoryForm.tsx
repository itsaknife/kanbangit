"use client";
import { useState, type FormEvent } from "react";
import { Button, Input, Textarea, Select, ErrorMessage, Modal } from "@/components/ui";
import { FolderGit2, Globe, LockKeyhole, Plus } from "lucide-react";
import { useAuth } from "@/hooks";
import { useRepositoriesStore } from "@/stores";
import { getErrorMessage } from "@/utils";

export function CreateRepositoryForm({
  initialOpen = false,
  hideTrigger = false,
  onClose,
}: { initialOpen?: boolean; hideTrigger?: boolean; onClose?: () => void } = {}) {
  const { user } = useAuth();
  const githubLinked = !!user?.identities?.some((i) => i.provider === "GITHUB");
  const [providerType, setProviderType] = useState<"GITHUB" | "KANBANGIT">("KANBANGIT");
  const [open, setInternalOpen] = useState(initialOpen);
  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    if (!next) onClose?.();
  };
  const createRepository = useRepositoriesStore((s) => s.createRepository);
  const reload = useRepositoriesStore((s) => s.fetchRepositories);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await createRepository({ name, description, visibility, providerType });
      setName("");
      setDescription("");
      setSuccess(true);
      setOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
      await reload(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {!hideTrigger && (
        <Button
          size="sm"
          onClick={() => {
            setError(null);
            setSuccess(false);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Tạo Project
        </Button>
      )}
      {success && (
        <p role="status" className="sr-only">
          Đã tạo Project.
        </p>
      )}
      <Modal
        open={open}
        title={
          <span className="flex items-center gap-2 pr-8">
            <FolderGit2 className="h-4 w-4 text-muted-foreground" />
            Tạo Project mới
          </span>
        }
        onClose={() => {
          if (!loading) setOpen(false);
        }}
      >
        <form onSubmit={submit} className="space-y-5">
          <div>
            <Input
              aria-label="Tên Project"
              placeholder="Tên Project"
              autoFocus
              className="h-12 border-0 bg-transparent px-0 text-lg font-medium shadow-none"
              required
              maxLength={100}
              pattern={providerType === "GITHUB" ? "[A-Za-z0-9_-][A-Za-z0-9_.-]*" : undefined}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <Textarea
            aria-label="Mô tả Project"
            placeholder="Thêm mô tả..."
            rows={4}
            className="resize-y border-0 bg-transparent px-0 shadow-none"
            maxLength={350}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
          <div className="flex flex-wrap items-center gap-3 border-t pt-4">
            <Select
              label="Loại Project"
              appearance="pill"
              value={providerType}
              onChange={(v) => setProviderType(v === "GITHUB" ? "GITHUB" : "KANBANGIT")}
              disabled={loading}
              options={[
                { value: "KANBANGIT", label: "KanbanGit" },
                { value: "GITHUB", label: "GitHub", disabled: !githubLinked },
              ]}
            />
            {providerType === "GITHUB" && (
              <Select
                label="Hiển thị"
                appearance="pill"
                value={visibility}
                onChange={(value) => setVisibility(value === "PUBLIC" ? "PUBLIC" : "PRIVATE")}
                disabled={loading}
                options={[
                  {
                    value: "PRIVATE",
                    label: "Private",
                    icon: <LockKeyhole className="h-3.5 w-3.5" />,
                    description: "Chỉ người được cấp quyền có thể truy cập.",
                  },
                  {
                    value: "PUBLIC",
                    label: "Public",
                    icon: <Globe className="h-3.5 w-3.5" />,
                    description: "Mọi người đều có thể xem trên GitHub.",
                  },
                ]}
              />
            )}
            <p className="text-xs text-muted-foreground">
              {providerType === "GITHUB"
                ? "Tạo trên GitHub cá nhân của bạn."
                : "Quản lý công việc độc lập trong KanbanGit."}
            </p>
          </div>
          {error && <ErrorMessage message={error} />}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" loading={loading}>
              {providerType === "GITHUB" ? "Tạo và kết nối" : "Tạo Project"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
