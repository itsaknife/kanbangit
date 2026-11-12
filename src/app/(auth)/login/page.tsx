import { LoginCard } from "@/components/auth";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Suspense fallback={<p>Đang tải đăng nhập...</p>}>
        <LoginCard />
      </Suspense>
    </main>
  );
}
