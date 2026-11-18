import { http } from "./http";
import type { Tracker, TrackerInput } from "@/types/tracker.types";
export const trackerService = {
  list: (repoId: string) => http.get<Tracker[]>(`/projects/${repoId}/trackers`),
  create: (repoId: string, input: TrackerInput) =>
    http.post<Tracker>(`/projects/${repoId}/trackers`, input),
  update: (repoId: string, id: string, input: Partial<TrackerInput>) =>
    http.patch<Tracker>(`/projects/${repoId}/trackers/${id}`, input),
  setActive: (repoId: string, id: string, isActive: boolean) =>
    http.patch<Tracker>(`/projects/${repoId}/trackers/${id}/active`, { isActive }),
};
