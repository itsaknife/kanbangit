import { http } from "./http";
import type { User } from "@/types";

export const profileService = {
  upload: (file: File, displayName: string | null) => {
    const data = new FormData();
    data.append("avatar", file);
    data.append("displayName", displayName ?? "");
    return http.upload<User>("/users/me/avatar", data);
  },
  update: (input: { displayName: string | null; customAvatarUrl?: string | null }) =>
    http.patch<User>("/users/me", input),
};
