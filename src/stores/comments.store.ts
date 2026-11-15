"use client";
import { create } from "zustand";
import { commentService } from "@/services/comment.service";
import type { Comment } from "@/types/collaboration.types";
import { getErrorMessage } from "@/utils";
interface Entry {
  data: Comment[];
  loading: boolean;
  error: string | null;
}
interface Store {
  entries: Record<string, Entry>;
  busy: boolean;
  load: (repoId: string, issueId: string) => Promise<void>;
  save: (repoId: string, issueId: string, content: string, id?: string) => Promise<Comment>;
  remove: (repoId: string, id: string) => Promise<void>;
  upload: (repoId: string, id: string, file: File) => Promise<void>;
  removeAttachment: (repoId: string, id: string) => Promise<void>;
  download: (repoId: string, id: string) => Promise<Blob>;
}
const versions = new Map<string, number>();
export const commentKey = (repoId: string, issueId: string) => repoId + ":" + issueId;
export const useCommentsStore = create<Store>((set, get) => {
  async function mutation<T>(action: () => Promise<T>) {
    set({ busy: true });
    try {
      return await action();
    } finally {
      set({ busy: false });
    }
  }
  return {
    entries: {},
    busy: false,
    load: async (repoId, issueId) => {
      const key = commentKey(repoId, issueId),
        version = (versions.get(key) ?? 0) + 1;
      versions.set(key, version);
      const update = (entry: Entry) => set((s) => ({ entries: { ...s.entries, [key]: entry } }));
      update({ data: get().entries[key]?.data ?? [], loading: true, error: null });
      try {
        const data = await commentService.list(repoId, issueId);
        if (versions.get(key) === version) update({ data, loading: false, error: null });
      } catch (error) {
        if (versions.get(key) === version)
          update({ data: [], loading: false, error: getErrorMessage(error) });
      }
    },
    save: (repoId, issueId, content, id) =>
      mutation(() =>
        id
          ? commentService.update(repoId, id, content)
          : commentService.create(repoId, issueId, content),
      ),
    remove: (repoId, id) =>
      mutation(async () => {
        await commentService.remove(repoId, id);
      }),
    upload: (repoId, id, file) =>
      mutation(async () => {
        await commentService.upload(repoId, id, file);
      }),
    removeAttachment: (repoId, id) =>
      mutation(async () => {
        await commentService.removeAttachment(repoId, id);
      }),
    download: (repoId, id) => commentService.download(repoId, id),
  };
});
