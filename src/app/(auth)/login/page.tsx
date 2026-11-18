import { LoginCard } from "@/components/auth";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <Suspense
        fallback={
          <p role="status" className="text-sm text-muted-foreground">
            Đang tải đăng nhập...
          </p>
        }
      >
        <LoginCard />
      </Suspense>
    </main>
  );
}
