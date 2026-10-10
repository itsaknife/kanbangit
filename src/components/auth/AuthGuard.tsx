"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ErrorMessage, Spinner } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks";
import { getErrorMessage } from "@/utils";

/** Chỉ cho người đã đăng nhập xem nội dung bên trong, người chưa đăng nhập bị đưa về trang login. */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !error && !user) router.replace(ROUTES.login);
  }, [loading, error, user, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto w-full max-w-md p-6">
        <ErrorMessage message={getErrorMessage(error, "Không kết nối được tới máy chủ")} />
      </div>
    );
  }
  if (!user) return null;

  return <>{children}</>;
}
