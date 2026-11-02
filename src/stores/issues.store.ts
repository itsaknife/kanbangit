"use client";
import { create } from "zustand";
import { issueService } from "@/services";
import type { CreateIssuePayload, Issue, IssueStatus } from "@/types";
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
  byRepository: Record<number, RepoState>;
  fetchIssues: (repoId: number) => Promise<void>;
  createIssue: (repoId: number, payload: CreateIssuePayload) => Promise<Issue>;
  moveIssue: (repoId: number, issueNumber: number, status: IssueStatus) => Promise<void>;
  applyIssue: (repoId: number, issue: Issue) => void;
  removeIssue: (repoId: number, issueNumber: number) => void;
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
