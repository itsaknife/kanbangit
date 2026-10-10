"use client";

import { useContext } from "react";
import { AuthContext } from "@/providers/AuthProvider";

/** Thông tin người dùng đang đăng nhập. Chỉ dùng được bên trong <AuthProvider>. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  return context;
}
