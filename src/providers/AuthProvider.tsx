"use client";

import { createContext, type ReactNode } from "react";
import { useAsync } from "@/hooks/useAsync";
import { ApiError, authService, disconnectSocket } from "@/services";
import type { User } from "@/types";

export interface AuthContextValue {
  user: User | null;
  /** Đang kiểm tra phiên đăng nhập. */
  loading: boolean;
  /** Lỗi khác 401 (ví dụ backend không phản hồi). */
  error: unknown;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchCurrentUser(): Promise<User | null> {
  try {
    return await authService.getMe();
  } catch (error) {
    // 401 nghĩa là chưa đăng nhập, không phải lỗi hệ thống
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, loading, error, setData } = useAsync(fetchCurrentUser, []);

  const logout = async () => {
    await authService.logout();
    disconnectSocket();
    setData(() => null);
  };

  return (
    <AuthContext value={{ user: data ?? null, loading, error, logout }}>{children}</AuthContext>
  );
}
