import type { ReactNode } from "react";
import { Header } from "./Header";

/** Khung chung của các trang sau khi đăng nhập: thanh đầu trang + vùng nội dung. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
