"use client";
import { create } from "zustand";
import { issueService } from "@/services";
import type { CreateIssuePayload, Issue, IssueStatus, UpdateIssuePayload } from "@/types";
import { getErrorMessage, upsertIssue } from "@/utils";

interface RepoState {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  actionError: string | null;
  isCreating: boolean;
  isMoving: boolean;
}
interface IssuesStore {
  loadIssue: (repoId: string, number: number) => Promise<Issue>;
  updateIssue: (repoId: string, number: number, payload: UpdateIssuePayload) => Promise<Issue>;
  updateStatus: (repoId: string, number: number, status: IssueStatus) => Promise<Issue>;
  byRepository: Record<string, RepoState>;
  fetchIssues: (repoId: string) => Promise<void>;
  createIssue: (repoId: string, payload: CreateIssuePayload) => Promise<Issue>;
  moveIssue: (repoId: string, issueNumber: number, status: IssueStatus) => Promise<void>;
  applyIssue: (repoId: string, issue: Issue) => void;
  removeIssue: (repoId: string, issueNumber: number) => void;
}
const empty = (): RepoState => ({
  issues: [],
  loading: false,
  error: null,
  actionError: null,
  isCreating: false,
  isMoving: false,
});

export const useIssuesStore = create<IssuesStore>((set, get) => ({
  loadIssue: async (repoId, number) => {
    const issue = await issueService.getByNumber(repoId, number);
    get().applyIssue(repoId, issue);
    return issue;
  },
  updateIssue: async (repoId, number, payload) => {
    try {
      const issue = await issueService.update(repoId, number, payload);
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
  updateStatus: async (repoId, number, status) => {
    try {
      const issue = await issueService.updateStatus(repoId, number, status);
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
          [repoId]: { ...empty(), ...s.byRepository[repoId], issues, loading: false },
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
  moveIssue: async (repoId, issueNumber, status) => {
    const previous = get().byRepository[repoId]?.issues.find(
      (issue) => issue.number === issueNumber,
    );
    if (!previous || previous.status === status) return;
    set((s) => ({
      byRepository: {
        ...s.byRepository,
        [repoId]: {
          ...s.byRepository[repoId],
          isMoving: true,
          actionError: null,
          issues: s.byRepository[repoId].issues.map((issue) =>
            issue.number === issueNumber ? { ...issue, status } : issue,
          ),
        },
      },
    }));
    try {
      const updated = await issueService.updateStatus(repoId, issueNumber, status);
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
              issue.number === issueNumber ? previous : issue,
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
  removeIssue: (repoId, number) =>
    set((s) => ({
      byRepository: {
        ...s.byRepository,
        [repoId]: {
          ...empty(),
          ...s.byRepository[repoId],
          issues: (s.byRepository[repoId]?.issues ?? []).filter((issue) => issue.number !== number),
        },
      },
    })),
}));
