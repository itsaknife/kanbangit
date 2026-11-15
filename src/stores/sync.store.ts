"use client";
import { create } from "zustand";
import { syncService } from "@/services/sync.service";
import type { SyncInfo, SyncQueueResult } from "@/types/sync.types";
import { getErrorMessage } from "@/utils";
interface Entry<T> {
  data?: T;
  loading: boolean;
  error: string | null;
}
interface Store {
  details: Record<string, Entry<SyncInfo>>;
  queues: Record<string, Entry<SyncQueueResult>>;
  busy: Record<string, boolean>;
  loadInfo: (repoId: string, issueId: string) => Promise<void>;
  loadQueue: (repoId: string, page: number) => Promise<void>;
  retry: (repoId: string, issueId?: string) => Promise<number>;
}
export const syncKey = (repoId: string, id: string | number) => `${repoId}:${id}`;
const versions = new Map<string, number>();
export const useSyncStore = create<Store>((set, get) => {
  async function load<T extends "details" | "queues">(
    bucket: T,
    key: string,
    request: () => Promise<T extends "details" ? SyncInfo : SyncQueueResult>,
  ) {
    const versionKey = `${bucket}:${key}`,
      version = (versions.get(versionKey) ?? 0) + 1;
    versions.set(versionKey, version);
    const update = (entry: object) => set((s) => ({ [bucket]: { ...s[bucket], [key]: entry } }));
    update({ ...get()[bucket][key], loading: true, error: null });
    try {
      const data = await request();
      if (versions.get(versionKey) === version) update({ data, loading: false, error: null });
    } catch (error) {
      if (versions.get(versionKey) === version)
        update({ loading: false, error: getErrorMessage(error) });
    }
  }
  return {
    details: {},
    queues: {},
    busy: {},
    loadInfo: (repoId, issueId) =>
      load("details", syncKey(repoId, issueId), () => syncService.info(repoId, issueId)),
    loadQueue: (repoId, page) =>
      load("queues", syncKey(repoId, page), () => syncService.queue(repoId, page)),
    retry: async (repoId, issueId) => {
      if (get().busy[repoId]) return 0;
      set((s) => ({ busy: { ...s.busy, [repoId]: true } }));
      try {
        return (await syncService.retry(repoId, issueId)).queued;
      } finally {
        set((s) => ({ busy: { ...s.busy, [repoId]: false } }));
      }
    },
  };
});
