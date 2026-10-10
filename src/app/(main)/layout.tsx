import { Suspense, type ReactNode } from "react";
import { AuthGuard } from "@/components/auth";
import { AppShell } from "@/components/layout";
import { Spinner } from "@/components/ui";
import { AuthProvider } from "@/providers/AuthProvider";

/** Mọi trang trong nhóm (main) đều yêu cầu đăng nhập và dùng chung khung AppShell. */
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <AuthProvider>
        <AuthGuard>
          <AppShell>{children}</AppShell>
        </AuthGuard>
      </AuthProvider>
    </Suspense>
  );
}
