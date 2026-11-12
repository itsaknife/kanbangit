"use client";
import { useState, type FormEvent } from "react";
import { Button, Input, ErrorMessage, Modal } from "@/components/ui";
import { useRepositoriesStore } from "@/stores";
import { getErrorMessage } from "@/utils";

export function CreateRepositoryForm() {
  const [open, setOpen] = useState(false);
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
      await createRepository({ name, description, visibility });
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
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setError(null);
            setSuccess(false);
            setOpen(true);
          }}
        >
          Tạo repository mới
        </Button>
      </div>
      {success && <p role="status">Đã tạo và kết nối repository.</p>}
      <Modal
        open={open}
        title="Tạo repository GitHub cá nhân"
        onClose={() => {
          if (!loading) setOpen(false);
        }}
      >
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="text-sm">
            Tên repository
            <Input
              required
              maxLength={100}
              pattern="[A-Za-z0-9_-][A-Za-z0-9_.-]*"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="text-sm">
            Mô tả
            <Input
              maxLength={350}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="text-sm">
            Hiển thị
            <select
              className="ml-3 rounded border p-2"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
              disabled={loading}
            >
              <option value="PRIVATE">Private</option>
              <option value="PUBLIC">Public</option>
            </select>
          </label>
          <p className="text-xs text-muted-foreground">
            GitHub cần quyền repo để tạo repository và đăng ký webhook. Nếu thiếu quyền, hãy đăng
            nhập lại để cấp quyền.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" loading={loading}>
              Tạo và kết nối
            </Button>
          </div>
          {error && <ErrorMessage message={error} />}
        </form>
      </Modal>
    </>
  );
}
