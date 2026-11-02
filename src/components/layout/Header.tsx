"use client";

import Link from "next/link";
import { Avatar, Button } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href={ROUTES.repositories} className="font-semibold">
          Kanbangit
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            <ThemeToggle />
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
