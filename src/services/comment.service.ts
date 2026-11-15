import { http } from "./http";
import type { Attachment, Comment } from "@/types/collaboration.types";
const root = (repoId: string) => `/repositories/${repoId}`;
export const commentService = {
  list: (repoId: string, issueId: string) =>
    http.get<{ data: Comment[] }>(root(repoId) + `/issues/${issueId}/comments`).then((r) => r.data),
  create: (repoId: string, issueId: string, content: string) =>
    http.post<Comment>(root(repoId) + `/issues/${issueId}/comments`, { content }),
  update: (repoId: string, id: string, content: string) =>
    http.patch<Comment>(root(repoId) + `/comments/${id}`, { content }),
  remove: (repoId: string, id: string) => http.delete(root(repoId) + `/comments/${id}`),
  upload: (repoId: string, id: string, file: File) => {
    const body = new FormData();
    body.append("file", file);
    return http.upload<Attachment>(root(repoId) + `/comments/${id}/attachments`, body);
  },
  removeAttachment: (repoId: string, id: string) =>
    http.delete(root(repoId) + `/attachments/${id}`),
  download: (repoId: string, id: string) => http.blob(root(repoId) + `/attachments/${id}`),
};
