"use client";
import { create } from "zustand";
import { notificationService } from "@/services/notification.service";
import type { MentionNotification } from "@/types/collaboration.types";
import { getErrorMessage } from "@/utils";
interface Store {
  data: MentionNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  read: (id: string) => Promise<void>;
  readAll: () => Promise<void>;
}
let version = 0;
export const useNotificationsStore = create<Store>((set, get) => ({
  data: [],
  unreadCount: 0,
  loading: false,
  error: null,
  load: async () => {
    const request = ++version;
    set({ loading: true, error: null });
    try {
      const result = await notificationService.list();
      if (request === version) set({ ...result, loading: false });
    } catch (error) {
      if (request === version)
        set({ data: [], unreadCount: 0, error: getErrorMessage(error), loading: false });
    }
  },
  read: async (id) => {
    await notificationService.read(id);
    await get().load();
  },
  readAll: async () => {
    await notificationService.readAll();
    await get().load();
  },
}));
