"use client";
import { useSearchParams } from "next/navigation";
import { buttonClassName, Card } from "@/components/ui";
import { authService } from "@/services";

export function LoginCard() {
  const code = useSearchParams().get("error");
  const error = code
    ? code === "session_expired"
      ? "Phiên đăng nhập đã hết hạn hoặc quyền GitHub đã bị thu hồi. Vui lòng đăng nhập lại."
      : code === "invalid_state"
        ? "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Hãy thử lại."
        : "GitHub chưa hoàn tất đăng nhập. Hãy thử lại và cấp quyền truy cập repository."
    : null;
  return (
    <Card className="flex w-full max-w-sm flex-col items-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">GitHub Task Board</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Quản lý công việc nhóm trên bảng Kanban, đồng bộ hai chiều với GitHub Issues.
      </p>
      {/* Dùng thẻ <a> vì backend sẽ chuyển hướng sang trang đăng nhập của GitHub */}
      <a href={authService.getLoginUrl()} className={buttonClassName({ size: "md" })}>
        Đăng nhập bằng GitHub
      </a>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <a href="https://github.com/signup" className="text-sm underline">
        Create a GitHub account
      </a>
    </Card>
  );
}
