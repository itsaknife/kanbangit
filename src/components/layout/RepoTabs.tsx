"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants";
import { useRepoId, useRepository } from "@/hooks";
import { cn } from "@/utils";

/** Tên repository + thanh chuyển giữa Bảng Kanban / Danh sách issue / Dashboard. */
export function RepoTabs() {
  const repoId = useRepoId();
  const pathname = usePathname();
  const { repository } = useRepository(repoId);

  const tabs = [
    { href: ROUTES.board(repoId), label: "Bảng Kanban" },
    { href: ROUTES.issues(repoId), label: "Danh sách issue" },
    { href: ROUTES.dashboard(repoId), label: "Dashboard" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm">
        <Link href={ROUTES.repositories} className="text-zinc-500 hover:underline">
          Repository
        </Link>
        <span className="text-zinc-400">/</span>
        <span className="font-medium">{repository?.fullName ?? "..."}</span>
      </div>

      <nav className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium",
              pathname.startsWith(tab.href)
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
