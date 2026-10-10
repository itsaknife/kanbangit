import { env } from "@/config/env";
import type { User } from "@/types";
import { http } from "./http";

export const authService = {
  /** Người dùng đang đăng nhập. Backend trả 401 nếu chưa đăng nhập. */
  getMe: () => http.get<User>("/auth/me"),

  /** Đường dẫn bắt đầu luồng OAuth GitHub (backend sẽ chuyển hướng sang GitHub). */
  getLoginUrl: () => `${env.apiUrl}/auth/github`,

  logout: () => http.post<void>("/auth/logout"),
};
