"use client";

import Link from "next/link";
import { Avatar, Button, Popover, PopoverTrigger, PopoverContent } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks";
import { ThemeToggle } from "./ThemeToggle";
import { PanelsTopLeft, LogOut, UserRound } from "lucide-react";
import { RepositorySwitcher } from "@/components/repositories/RepositorySwitcher";
import { useState } from "react";
import { MentionNotifications } from "@/components/notifications/MentionNotifications";

export function Header() {
  const { user, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="border-b bg-card/95 backdrop-blur">
      <div className="flex h-11 w-full items-center justify-between gap-2 px-3 lg:px-2">
        <div className="flex min-w-0 items-center gap-1">
          <Link
            href={ROUTES.repositories}
            aria-label="Trang chủ Kanbangit"
            title="Trang chủ Kanbangit"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-emerald-500 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PanelsTopLeft className="h-5 w-5" aria-hidden />
          </Link>
          <RepositorySwitcher />
        </div>

        {user && (
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <MentionNotifications />
            <Popover open={accountOpen} onOpenChange={setAccountOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Mở menu tài khoản"
                  className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar
                    src={user.customAvatarUrl || user.avatarUrl}
                    alt={user.login}
                    size={24}
                    unoptimized
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" compact>
                <div className="border-b px-2 py-2">
                  <p className="truncate text-xs font-medium">
                    {user.displayName || user.name || user.login}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">@{user.login}</p>
                </div>
                <Link
                  href={ROUTES.settings}
                  onClick={() => setAccountOpen(false)}
                  className="mt-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <UserRound className="h-4 w-4" />
                  Tài khoản
                </Link>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              aria-label="Đăng xuất"
              title="Đăng xuất"
              className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
