"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Avatar, Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks";
import { useProfileStore } from "@/stores/profile.store";
import type { User } from "@/types";

export function ProfileSettings({ user }: { user: User }) {
  const { updateUser } = useAuth();
  const [name, setName] = useState(user.displayName ?? "");
  const [avatar, setAvatar] = useState(user.customAvatarUrl ?? "");
  const [file, setFile] = useState<File>();
  const [fileError, setFileError] = useState("");
  const [filePreview, setFilePreview] = useState("");
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);
  const [failedAvatar, setFailedAvatar] = useState("");
  const [saved, setSaved] = useState(false);
  const busy = useProfileStore((s) => s.busy);
  const error = useProfileStore((s) => s.error);
  const save = useProfileStore((s) => s.save);
  const preview = (file && filePreview) || avatar || user.avatarUrl;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaved(false);
    try {
      const updated = await save(
        {
          displayName: name.trim() || null,
          customAvatarUrl: avatar ? undefined : null,
        },
        file,
      );
      setAvatar(updated.customAvatarUrl ?? "");
      setFile(undefined);
      updateUser(updated);
      setSaved(true);
    } catch {
      /* Store renders the request error; keep the form values. */
    }
  };
  return (
    <form
      className="overflow-hidden rounded-lg border bg-card"
      onSubmit={submit}
      onChange={() => setSaved(false)}
    >
      <div className="space-y-5 p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">
          Tùy chỉnh tên và avatar của bạn trong KanbanGit. Hồ sơ GitHub không thay đổi.
        </p>
        <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
          <Avatar
            src={failedAvatar === preview ? user.avatarUrl : preview}
            alt={name || user.login}
            size={56}
            unoptimized
            onError={() => setFailedAvatar(preview)}
          />
          <div>
            <p className="font-medium">{name.trim() || user.name || user.login}</p>
            <p className="text-sm text-muted-foreground">@{user.login}</p>
          </div>
        </div>
        <Input
          id="profile-name"
          label="Tên hiển thị"
          placeholder={user.name || user.login}
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
        />
        <Input
          id="profile-avatar"
          label="Tải ảnh avatar"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            setFileError("");
            if (!selected) return;
            if (
              !["image/png", "image/jpeg", "image/webp"].includes(selected.type) ||
              selected.size > 2 * 1024 * 1024
            ) {
              setFileError("Chọn ảnh PNG, JPEG hoặc WebP tối đa 2 MB.");
              e.target.value = "";
              return;
            }
            setFile(selected);
            setFilePreview(URL.createObjectURL(selected));
          }}
          disabled={busy}
        />
        <p className="text-xs text-muted-foreground">
          Ảnh PNG, JPEG hoặc WebP, tối đa 2 MB. Ảnh chỉ dùng trong KanbanGit.
        </p>
        {fileError && (
          <p role="alert" className="text-sm text-destructive">
            {fileError}
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
            Đã lưu hồ sơ.
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t bg-muted/25 p-4">
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => {
            setName("");
            setAvatar("");
            setFile(undefined);
            setFileError("");
          }}
        >
          Dùng hồ sơ GitHub
        </Button>
        <Button type="submit" loading={busy}>
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
