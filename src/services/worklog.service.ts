import { http } from "./http";
import type {
  TimeQuery,
  TimeSummary,
  WorklogPayload,
  WorklogResult,
} from "@/types/collaboration.types";
const root = (repoId: string) => `/repositories/${repoId}`;
export const worklogService = {
  list: (repoId: string, query: TimeQuery) =>
    http.get<WorklogResult>(root(repoId) + "/worklogs", { ...query }),
  summary: (repoId: string, issueId: string) =>
    http.get<TimeSummary>(root(repoId) + `/issues/${issueId}/time-summary`),
  create: (repoId: string, issueId: string, body: WorklogPayload) =>
    http.post<{ id: string }>(root(repoId) + `/issues/${issueId}/worklogs`, body),
  update: (repoId: string, id: string, body: Omit<WorklogPayload, "memberId">) =>
    http.patch<{ id: string }>(root(repoId) + `/worklogs/${id}`, body),
  remove: (repoId: string, id: string) => http.delete(root(repoId) + `/worklogs/${id}`),
};
