"use client";
import { create } from "zustand";
import { worklogService } from "@/services/worklog.service";
import type {
  TimeQuery,
  TimeSummary,
  WorklogPayload,
  WorklogResult,
} from "@/types/collaboration.types";
import { getErrorMessage } from "@/utils";
interface Entry {
  data?: WorklogResult;
  summary?: TimeSummary;
  loading: boolean;
  error: string | null;
}
interface Store {
  entries: Record<string, Entry>;
  busy: boolean;
  load: (repoId: string, query: TimeQuery) => Promise<void>;
  save: (repoId: string, issueId: string, body: WorklogPayload, id?: string) => Promise<void>;
  remove: (repoId: string, id: string) => Promise<void>;
}
export const worklogKey = (repoId: string, query: TimeQuery) =>
  JSON.stringify([
    repoId,
    query.issueId ?? "",
    query.memberId ?? "",
    query.period ?? "all",
    query.from ?? "",
    query.to ?? "",
  ]);
const versions = new Map<string, number>();
export const useWorklogsStore = create<Store>((set) => {
  const mutation = async (action: () => Promise<unknown>) => {
    set({ busy: true });
    try {
      await action();
    } finally {
      set({ busy: false });
    }
  };
  return {
    entries: {},
    busy: false,
    load: async (repoId, query) => {
      const key = worklogKey(repoId, query),
        version = (versions.get(key) ?? 0) + 1;
      versions.set(key, version);
      const update = (data: Partial<Entry>) =>
        set((s) => ({
          entries: {
            ...s.entries,
            [key]: { ...s.entries[key], loading: false, error: null, ...data },
          },
        }));
      update({ loading: true, error: null });
      try {
        const [data, summary] = await Promise.all([
          worklogService.list(repoId, query),
          query.issueId ? worklogService.summary(repoId, query.issueId) : undefined,
        ]);
        if (versions.get(key) === version) update({ data, summary, loading: false });
      } catch (error) {
        if (versions.get(key) === version)
          update({
            data: undefined,
            summary: undefined,
            loading: false,
            error: getErrorMessage(error),
          });
      }
    },
    save: (repoId, issueId, body, id) =>
      mutation(() =>
        id
          ? worklogService.update(repoId, id, {
              startAt: body.startAt,
              endAt: body.endAt,
              description: body.description,
            })
          : worklogService.create(repoId, issueId, body),
      ),
    remove: (repoId, id) => mutation(() => worklogService.remove(repoId, id)),
  };
});
