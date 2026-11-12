"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRepoId, useRepository } from "@/hooks";
import { useTrackersStore } from "@/stores/trackers.store";
import { Button, Card, Input, Modal, ErrorMessage, Spinner } from "@/components/ui";
import type { Tracker, TrackerInput } from "@/types/tracker.types";
import { TrackerIcon } from "./TrackerIcon";
const blank: TrackerInput = { name: "", prefix: "", color: "#3B82F6", displayOrder: 0 };
export function TrackerManagement() {
  const repoId = useRepoId();
  const { repository } = useRepository(repoId);
  const state = useTrackersStore((s) => s.byRepository[repoId]);
  const fetch = useTrackersStore((s) => s.fetch);
  const save = useTrackersStore((s) => s.save);
  const setActive = useTrackersStore((s) => s.setActive);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string>();
  const [values, setValues] = useState<TrackerInput>(blank);
  useEffect(() => {
    void fetch(repoId);
  }, [repoId, fetch]);
  const edit = (tracker?: Tracker) => {
    setEditing(tracker?.id);
    setValues(
      tracker
        ? {
            name: tracker.name,
            prefix: tracker.prefix,
            color: tracker.color,
            displayOrder: tracker.displayOrder,
          }
        : { ...blank },
    );
    setOpen(true);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await save(repoId, values, editing);
      setOpen(false);
    } catch {
      /* Error belongs to this repository's store. */
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Trackers</h1>
        {repository?.canManage && <Button onClick={() => edit()}>Tạo Tracker</Button>}
      </div>
      <p className="text-sm text-muted-foreground">
        Tracker độc lập với GitHub Label. Issue Code giữ nguyên khi đổi Tracker hoặc prefix.
      </p>
      {state?.loading && <Spinner />}
      {state?.error && <ErrorMessage message={state.error} onRetry={() => fetch(repoId, true)} />}
      {state?.actionError && !open && <ErrorMessage message={state.actionError} />}
      {state?.loaded && !state.items.some((t) => t.isActive) && (
        <p role="status">
          Chưa có Tracker hoạt động. Cần Owner kích hoạt ít nhất một Tracker để tạo Issue.
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {state?.items.map((tracker) => (
          <Card key={tracker.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <TrackerIcon tracker={tracker} />
              <h2 className="font-semibold">{tracker.name}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {tracker.prefix} · {tracker.isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"} · Thứ tự{" "}
              {tracker.displayOrder}
            </p>
            {repository?.canManage && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={state.busy}
                  onClick={() => edit(tracker)}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={state.busy}
                  onClick={() => {
                    void setActive(repoId, tracker.id, !tracker.isActive).catch(() => {});
                  }}
                >
                  {tracker.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
      <Modal
        open={open}
        title={editing ? "Chỉnh sửa Tracker" : "Tạo Tracker"}
        onClose={() => {
          if (!state?.busy) setOpen(false);
        }}
      >
        <form className="space-y-4" onSubmit={submit}>
          <Input
            label="Tên Tracker"
            required
            maxLength={80}
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />
          <Input
            label="Prefix"
            required
            pattern="[A-Z][A-Z0-9]{1,11}"
            maxLength={12}
            value={values.prefix}
            onChange={(e) => setValues({ ...values, prefix: e.target.value.toUpperCase() })}
          />
          <p className="text-xs text-muted-foreground">
            Prefix đã sử dụng được giữ cho Tracker này; không đổi mã Issue cũ.
          </p>
          <Input
            label="Màu"
            type="color"
            required
            value={values.color}
            onChange={(e) => setValues({ ...values, color: e.target.value })}
          />
          <Input
            label="Thứ tự"
            type="number"
            min={0}
            max={10000}
            required
            value={values.displayOrder}
            onChange={(e) => setValues({ ...values, displayOrder: Number(e.target.value) })}
          />
          {state?.actionError && <ErrorMessage message={state.actionError} />}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" disabled={state?.busy} onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" loading={state?.busy}>
              Lưu Tracker
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
