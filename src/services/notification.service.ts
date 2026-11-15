import { http } from "./http";
import type { MentionNotification } from "@/types/collaboration.types";
export const notificationService = {
  list: () => http.get<{ data: MentionNotification[]; unreadCount: number }>("/notifications"),
  read: (id: string) => http.patch(`/notifications/${id}/read`),
  readAll: () => http.post("/notifications/read-all"),
};
