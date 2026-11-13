"use client";
import { create } from "zustand";
import { issueService } from "@/services";
import type { CreateIssuePayload, Issue, IssueStatus, UpdateIssuePayload } from "@/types";
import { getErrorMessage, upsertIssue } from "@/utils";

interface RepoState {
  issues: Issue[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  actionError: string | null;
  isCreating: boolean;
  isMoving: boolean;
}
interface IssuesStore {
  loadSubIssues: (repoId: string, id: string) => Promise<Issue[]>;
  setParent: (repoId: string, id: string, parentId: string | null) => Promise<Issue>;
  cascadeClose: (repoId: string, id: string) => Promise<Issue>;

  loadIssue: (repoId: string, id: string) => Promise<Issue>;
  updateIssue: (repoId: string, id: string, payload: UpdateIssuePayload) => Promise<Issue>;
  updateStatus: (repoId: string, id: string, status: IssueStatus) => Promise<Issue>;
  byRepository: Record<string, RepoState>;
  fetchIssues: (repoId: string) => Promise<void>;
  createIssue: (repoId: string, payload: CreateIssuePayload) => Promise<Issue>;
  moveIssue: (repoId: string, issueId: string, status: IssueStatus) => Promise<void>;
  applyIssue: (repoId: string, issue: Issue) => void;
  removeIssue: (repoId: string, issueId: string) => void;
}
const empty = (): RepoState => ({
  issues: [],
  loading: false,
  loaded: false,
  error: null,
  actionError: null,
  isCreating: false,
  isMoving: false,
});

export const useIssuesStore = create<IssuesStore>((set, get) => ({
  loadSubIssues: (repoId, id) => issueService.subIssues(repoId, id),
  setParent: async (repoId, id, parentId) => {
    if (parentId) await issueService.setParent(repoId, id, parentId);
    else await issueService.removeParent(repoId, id);
    const issue = await get().loadIssue(repoId, id);
    await get().fetchIssues(repoId);
    return issue;
  },
  cascadeClose: async (repoId, id) => {
    await issueService.cascadeClose(repoId, id);
    const issue = await get().loadIssue(repoId, id);
    await get().fetchIssues(repoId);
    return issue;
  },
  loadIssue: async (repoId, id) => {
    const issue = await issueService.getById(repoId, id);
    get().applyIssue(repoId, issue);
    return issue;
  },
  updateIssue: async (repoId, id, payload) => {
    try {
      const issue = await issueService.update(repoId, id, payload);
      get().applyIssue(repoId, issue);
      void get().fetchIssues(repoId);
      return issue;
    } catch (error) {
      set((s) => ({
        byRepository: {
          ...s.byRepository,
          [repoId]: { ...empty(), ...s.byRepository[repoId], actionError: getErrorMessage(error) },
        },
      }));
      throw error;
    }
  },
  updateStatus: async (repoId, id, status) => {
    try {
      const issue = await issueService.updateStatus(repoId, id, status);
      get().applyIssue(repoId, issue);
      return issue;
    } catch (error) {
      set((s) => ({
        byRepository: {
          ...s.byRepository,
          [repoId]: { ...empty(), ...s.byRepository[repoId], actionError: getErrorMessage(error) },
        },
      }));
      throw error;
    }
  },
  byRepository: {},
  fetchIssues: async (repoId) => {
    set((s) => ({
      byRepository: {
        ...s.byRepository,
        [repoId]: { ...empty(), ...s.byRepository[repoId], loading: true, error: null },
      },
    }));
    try {
      const issues = await issueService.list(repoId);
      set((s) => ({
        byRepository: {
          ...s.byRepository,
          [repoId]: { ...empty(), ...s.byRepository[repoId], issues, loading: false, loaded: true },
        },
      }));
    } catch (error) {
      set((s) => ({
        byRepository: {
          ...s.byRepository,
          [repoId]: {
            ...empty(),
            ...s.byRepository[repoId],
            loading: false,
            loaded: false,
            error: getErrorMessage(error),
          },
        },
      }));
    }
  },
  createIssue: async (repoId, payload) => {
    set((s) => ({
      byRepository: {
        ...s.byRepository,
        [repoId]: { ...empty(), ...s.byRepository[repoId], isCreating: true, actionError: null },
      },
    }));
    try {
      const issue = await issueService.create(repoId, payload);
      get().applyIssue(repoId, issue);
      set((s) => ({
        byRepository: {
          ...s.byRepository,
          [repoId]: { ...s.byRepository[repoId], isCreating: false },
        },
      }));
      return issue;
    } catch (error) {
      set((s) => ({
        byRepository: {
          ...s.byRepository,
          [repoId]: {
            ...s.byRepository[repoId],
            isCreating: false,
            actionError: getErrorMessage(error),
          },
        },
      }));
      throw error;
    }
  },
  moveIssue: async (repoId, issueId, status) => {
    const previous = get().byRepository[repoId]?.issues.find((issue) => issue.id === issueId);
    if (!previous || previous.status === status || get().byRepository[repoId]?.isMoving) return;
    set((s) => ({
      byRepository: {
        ...s.byRepository,
        [repoId]: {
          ...s.byRepository[repoId],
          isMoving: true,
          actionError: null,
          issues: s.byRepository[repoId].issues.map((issue) =>
            issue.id === issueId ? { ...issue, status } : issue,
          ),
        },
      },
    }));
    try {
      const updated = await issueService.updateStatus(repoId, issueId, status);
      get().applyIssue(repoId, updated);
      set((s) => ({
        byRepository: {
          ...s.byRepository,
          [repoId]: { ...s.byRepository[repoId], isMoving: false },
        },
      }));
    } catch (error) {
      set((s) => ({
        byRepository: {
          ...s.byRepository,
          [repoId]: {
            ...s.byRepository[repoId],
            isMoving: false,
            actionError: getErrorMessage(error),
            issues: s.byRepository[repoId].issues.map((issue) =>
              issue.id === issueId ? previous : issue,
            ),
          },
        },
      }));
    }
  },
  applyIssue: (repoId, issue) =>
    set((s) => ({
      byRepository: {
        ...s.byRepository,
        [repoId]: {
          ...empty(),
          ...s.byRepository[repoId],
          issues: upsertIssue(s.byRepository[repoId]?.issues ?? [], issue),
        },
      },
    })),
  removeIssue: (repoId, id) =>
    set((s) => ({
      byRepository: {
        ...s.byRepository,
        [repoId]: {
          ...empty(),
          ...s.byRepository[repoId],
          issues: (s.byRepository[repoId]?.issues ?? []).filter((issue) => issue.id !== id),
        },
      },
    })),
}));
