"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants";
import { useRepoId } from "@/hooks";
import { cn } from "@/utils";
import type { Ref } from "react";

/** Hai chế độ xem công việc và toolbar dùng chung. */
export function RepoTabs({ toolbarRef }: { toolbarRef?: Ref<HTMLDivElement> }) {
  const repoId = useRepoId();
  const pathname = usePathname();

  const tabs = [
    { href: ROUTES.board(repoId), label: "Bảng Kanban" },
    { href: ROUTES.issues(repoId), label: "Danh sách issue" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {(pathname.startsWith(ROUTES.board(repoId)) ||
        pathname.startsWith(ROUTES.issues(repoId))) && (
        <div className="flex items-end justify-between gap-3 border-b">
          <nav aria-label="Chế độ xem công việc" className="flex min-w-0 gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={pathname.startsWith(tab.href) ? "page" : undefined}
                className={cn(
                  "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(tab.href)
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
          <div ref={toolbarRef} className="flex shrink-0 items-center gap-2 pb-2" />
        </div>
      )}
    </div>
  );
}
