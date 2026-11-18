import { http } from "./http";
export type IdentityProvider = "GOOGLE" | "GITHUB";
export interface Identity {
  provider: IdentityProvider;
  email: string | null;
  emailVerified: boolean;
  login: string | null;
}
export const identityService = {
  list: () => http.get<Identity[]>("/users/me/identities"),
  link: (provider: IdentityProvider) =>
    http.post<{ url: string }>(`/users/me/identities/${provider}/link`),
  unlink: (provider: IdentityProvider) => http.delete(`/users/me/identities/${provider}`),
};
