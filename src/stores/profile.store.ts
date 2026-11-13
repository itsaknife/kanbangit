"use client";
import { create } from "zustand";
import { profileService } from "@/services/profile.service";
import type { User } from "@/types";
import { getErrorMessage } from "@/utils";

export const useProfileStore = create<{
  busy: boolean;
  error: string | null;
  save: (
    input: { displayName: string | null; customAvatarUrl?: string | null },
    file?: File,
  ) => Promise<User>;
}>((set) => ({
  busy: false,
  error: null,
  save: async (input, file) => {
    set({ busy: true, error: null });
    try {
      return file
        ? await profileService.upload(file, input.displayName)
        : await profileService.update(input);
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    } finally {
      set({ busy: false });
    }
  },
}));
