"use client";

import Link from "next/link";
import { ArrowLeft, GitBranch, Moon, Sun, UserRound, Palette } from "lucide-react";
import { useAuth } from "@/hooks";
import { useTheme } from "@/providers/ThemeProvider";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui";
import { ProfileSettings } from "./ProfileSettings";

export function AccountSettings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  if (!user) return null;
  return (
    <div className="min-h-[calc(100vh-6.5rem)] overflow-hidden rounded-lg border md:grid md:grid-cols-[230px_1fr]">
      <aside className="border-b bg-card/50 md:border-b-0 md:border-r">
        <Link
          href={ROUTES.repositories}
          className="flex items-center gap-2 border-b px-5 py-4 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại repository
        </Link>
        <nav aria-label="Cài đặt tài khoản" className="space-y-1 p-3 md:sticky md:top-0">
          <p className="px-2 pb-2 pt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
            Cài đặt tài khoản
          </p>
          <a
            href="#profile"
            className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium"
          >
            <UserRound className="h-4 w-4" />
            Hồ sơ hiển thị
          </a>
          <a
            href="#appearance"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
          >
            <Palette className="h-4 w-4" />
            Giao diện
          </a>
        </nav>
      </aside>
      <div className="mx-auto w-full max-w-3xl space-y-10 px-5 py-10 sm:px-10 lg:py-12">
        <div>
          <h1 className="text-xl font-semibold">Cài đặt tài khoản</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quản lý hồ sơ và trải nghiệm của bạn trong KanbanGit.
          </p>
        </div>
        <section id="profile" className="scroll-mt-6 space-y-4">
          <h2 className="text-base font-semibold">Hồ sơ hiển thị</h2>
          <ProfileSettings user={user} />
        </section>
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Tài khoản kết nối</h2>
          <div className="flex items-center gap-4 rounded-lg border bg-card p-5">
            <GitBranch className="h-6 w-6" />
            <div className="flex-1">
              <p className="text-sm font-medium">GitHub</p>
              <p className="text-xs text-muted-foreground">@{user.login}</p>
            </div>
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-700 dark:text-emerald-400">
              Đã kết nối
            </span>
          </div>
        </section>
        <section id="appearance" className="scroll-mt-6 space-y-4">
          <h2 className="text-base font-semibold">Giao diện</h2>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-5">
            <div>
              <p className="text-sm font-medium">Chế độ hiển thị</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Đang dùng giao diện {theme === "dark" ? "tối" : "sáng"}.
              </p>
            </div>
            <Button variant="secondary" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}Chuyển
              sang {theme === "dark" ? "sáng" : "tối"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
