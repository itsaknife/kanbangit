"use client";

import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { Header } from "./Header";
import { RepositorySidebar } from "./RepositorySidebar";

/** Khung chung của các trang sau khi đăng nhập: thanh đầu trang + vùng nội dung. */
export function AppShell({ children }: { children: ReactNode }) {
  const { repoId } = useParams<{ repoId?: string }>();
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Header />
      <div className="flex flex-1 flex-col md:flex-row">
        {repoId && <RepositorySidebar repoId={repoId} />}
        <main className="mx-auto w-full min-w-0 max-w-[1440px] flex-1 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
