import { buttonClassName, Card } from "@/components/ui";
import { authService } from "@/services";

export function LoginCard() {
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
    </Card>
  );
}
