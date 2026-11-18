"use client";
import { create } from "zustand";
import { identityService, type Identity, type IdentityProvider } from "@/services/identity.service";
import { getErrorMessage } from "@/utils";
import { authService } from "@/services/auth.service";
import type { User } from "@/types";
interface State {
  data: Identity[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  link: (p: IdentityProvider) => Promise<string>;
  unlink: (p: IdentityProvider) => Promise<User>;
}
export const useIdentitiesStore = create<State>((set, get) => ({
  data: [],
  loading: false,
  error: null,
  load: async () => {
    set({ loading: true, error: null });
    try {
      set({ data: await identityService.list() });
    } catch (e) {
      set({ error: getErrorMessage(e) });
    } finally {
      set({ loading: false });
    }
  },
  link: async (p) => {
    set({ loading: true, error: null });
    try {
      return (await identityService.link(p)).url;
    } catch (e) {
      set({ error: getErrorMessage(e) });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  unlink: async (p) => {
    set({ loading: true, error: null });
    try {
      await identityService.unlink(p);
      await get().load();
      return await authService.getMe();
    } catch (e) {
      set({ error: getErrorMessage(e) });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
}));
