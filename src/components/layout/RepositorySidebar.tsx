"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChartNoAxesCombined, ListTodo, Tags, UsersRound } from "lucide-react";
import { ROUTES } from "@/constants";
import { cn } from "@/utils";

export function RepositorySidebar({ repoId }: { repoId: string }) {
  const pathname = usePathname();
  const workActive =
    pathname.startsWith(ROUTES.board(repoId)) || pathname.startsWith(ROUTES.issues(repoId));
  const entries = [
    { href: ROUTES.board(repoId), label: "Công việc", icon: ListTodo, active: workActive },
    { href: ROUTES.dashboard(repoId), label: "Dashboard", icon: ChartNoAxesCombined },
    { href: `/repositories/${repoId}/members`, label: "Thành viên", icon: UsersRound },
    { href: `/repositories/${repoId}/trackers`, label: "Trackers", icon: Tags },
  ];
  return (
    <aside className="group relative z-30 shrink-0 border-b md:w-14 md:border-b-0">
      <div className="bg-card p-2 md:sticky md:top-0 md:min-h-[calc(100vh-3.5rem)] md:w-14 md:overflow-hidden md:border-r md:transition-[width,box-shadow] md:duration-150 md:group-hover:w-56 md:group-hover:shadow-xl md:group-focus-within:w-56 md:group-focus-within:shadow-xl motion-reduce:transition-none">
        <Link
          href={ROUTES.repositories}
          aria-label="Tất cả repository"
          title="Tất cả repository"
          className="mb-3 hidden h-9 items-center gap-2 overflow-hidden whitespace-nowrap rounded-md px-3 text-xs text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="md:invisible md:group-hover:visible md:group-focus-within:visible">
            Tất cả repository
          </span>
        </Link>
        <nav
          aria-label="Điều hướng repository"
          className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible"
        >
          {entries.map(({ href, label, icon: Icon, active }) => {
            const selected = active ?? pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={selected ? "page" : undefined}
                aria-label={label}
                title={label}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-2.5 overflow-hidden whitespace-nowrap rounded-md px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="md:invisible md:group-hover:visible md:group-focus-within:visible">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
