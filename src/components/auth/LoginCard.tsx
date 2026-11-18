"use client";
import { useSearchParams } from "next/navigation";
import { buttonClassName, Card } from "@/components/ui";
import { authService } from "@/services";
import { identityErrorMessage } from "@/utils/identityError";
import { AlertCircle, PanelsTopLeft, ArrowUpRight } from "lucide-react";
import { ProviderIcon } from "./ProviderIcon";
import { cn } from "@/utils";

export function LoginCard() {
  const code = useSearchParams().get("error");
  const error = identityErrorMessage(code);
  return (
    <section aria-labelledby="login-title" className="w-full max-w-sm">
      <div className="mb-7 flex items-center justify-center gap-2.5">
        <PanelsTopLeft aria-hidden className="h-7 w-7 text-emerald-500" />
        <span className="text-xl font-semibold tracking-tight">KanbanGit</span>
      </div>
      <Card className="rounded-xl">
        <div className="space-y-6 px-2 py-4 sm:px-4 sm:py-5">
          <div className="space-y-2 text-center">
            <h1 id="login-title" className="text-xl font-semibold tracking-tight">
              Chào mừng đến KanbanGit
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Đăng nhập để quản lý Project và công việc của bạn.
            </p>
          </div>
          <div className="space-y-3">
            <a
              href={authService.getLoginUrl("google")}
              className={cn(
                buttonClassName({ variant: "secondary", size: "md" }),
                "relative h-11 w-full border-[#747775] bg-white! text-[#1f1f1f]! hover:bg-zinc-50! focus-visible:ring-offset-background",
              )}
            >
              <span className="absolute left-3">
                <ProviderIcon provider="GOOGLE" />
              </span>
              <span className="px-5">Tiếp tục với Google</span>
            </a>
            {/* Dùng thẻ <a> vì backend sẽ chuyển hướng sang trang đăng nhập của GitHub */}
            <a
              href={authService.getLoginUrl()}
              className={cn(
                buttonClassName({ variant: "secondary", size: "md" }),
                "relative h-11 w-full focus-visible:ring-offset-background",
              )}
            >
              <span className="absolute left-3">
                <ProviderIcon provider="GITHUB" />
              </span>
              <span className="px-5">Tiếp tục với GitHub</span>
            </a>
          </div>
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p className="min-w-0 leading-5">{error}</p>
            </div>
          )}
          <p className="border-t pt-5 text-center text-xs leading-5 text-muted-foreground">
            Lần đầu đăng nhập? Tài khoản KanbanGit sẽ được tạo tự động.
          </p>
        </div>
      </Card>
      <p className="mt-5 text-center text-xs text-muted-foreground">
        Chưa có GitHub?{" "}
        <a
          href="https://github.com/signup"
          className="inline-flex items-center gap-0.5 rounded-sm text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Tạo tài khoản
          <ArrowUpRight aria-hidden className="h-3 w-3" />
        </a>
      </p>
    </section>
  );
}
