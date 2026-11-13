"use client";

import Link from "next/link";
import { Avatar, Button, Popover, PopoverTrigger, PopoverContent } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks";
import { ThemeToggle } from "./ThemeToggle";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { RepositorySwitcher } from "@/components/repositories/RepositorySwitcher";
import { useState } from "react";

export function Header() {
  const { user, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="border-b bg-card/95 backdrop-blur">
      <div className="flex h-14 w-full items-center justify-between gap-3 px-4 lg:px-6">
        <RepositorySwitcher />

        {user && (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Popover open={accountOpen} onOpenChange={setAccountOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Mở menu tài khoản"
                  className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar
                    src={user.customAvatarUrl || user.avatarUrl}
                    alt={user.login}
                    size={28}
                    unoptimized
                  />
                  <span className="text-sm">{user.displayName || user.name || user.login}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-1">
                <div className="border-b px-3 py-3">
                  <p className="text-sm font-medium">
                    {user.displayName || user.name || user.login}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">@{user.login}</p>
                </div>
                <Link
                  href={ROUTES.settings}
                  onClick={() => setAccountOpen(false)}
                  className="my-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <UserRound className="h-4 w-4" />
                  Tài khoản
                </Link>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              aria-label="Đăng xuất"
              title="Đăng xuất"
              className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
