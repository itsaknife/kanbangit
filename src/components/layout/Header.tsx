"use client";

import Link from "next/link";
import { Avatar, Button } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href={ROUTES.repositories} className="font-semibold">
          GitHub Task Board
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            <Avatar src={user.avatarUrl} alt={user.login} size={28} />
            <span className="text-sm">{user.login}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Đăng xuất
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
