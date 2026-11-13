"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Check,
  ChevronsUpDown,
  FolderGit2,
  LayoutGrid,
  Plus,
  Search,
  Download,
  PanelsTopLeft,
} from "lucide-react";
import { Button, Input, Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { useRepositories } from "@/hooks";
import { useRepositoriesStore } from "@/stores";
import { ROUTES } from "@/constants";
import { getErrorMessage } from "@/utils";
import { CreateRepositoryForm } from "./CreateRepositoryForm";
import { ImportRepositoryDialog } from "./ImportRepositoryDialog";

export function RepositorySwitcher() {
  const { repoId } = useParams<{ repoId?: string }>();
  const { repositories, loading, error, reload } = useRepositories();
  const detail = useRepositoriesStore((s) => (repoId ? s.details[repoId]?.data : undefined));
  const fetchAvailable = useRepositoriesStore((s) => s.fetchAvailable);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<"create" | "import" | null>(null);
  const current = repositories.find((r) => r.id === repoId) ?? detail;
  const items = repositories.filter(
    (r) => r.isConnected && r.fullName.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const startAction = (next: "create" | "import") => {
    setOpen(false);
    setAction(next);
    if (next === "import") void fetchAvailable();
  };
  return (
    <>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setSearch("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Chọn repository"
            className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PanelsTopLeft className="h-5 w-5 shrink-0 text-emerald-500" />
            <span className="max-w-[35vw] truncate sm:max-w-80">
              {current?.fullName ?? "Kanbangit"}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)] p-1">
          <div className="relative border-b p-2">
            <Search aria-hidden className="absolute left-4 top-5 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Tìm repository"
              placeholder="Tìm repository..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 border-0 bg-transparent pl-8 shadow-none"
            />
          </div>
          <Link
            href={ROUTES.repositories}
            onClick={() => setOpen(false)}
            className="my-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            Tất cả repo{!repoId && <Check className="ml-auto h-4 w-4" />}
          </Link>
          <div className="max-h-64 overflow-y-auto border-t py-1">
            {loading && (
              <p role="status" className="px-3 py-3 text-xs text-muted-foreground">
                Đang tải repository...
              </p>
            )}
            {error && (
              <div role="alert" className="px-3 py-2 text-xs text-destructive">
                {getErrorMessage(error)}
                <Button variant="ghost" size="sm" onClick={() => void reload()}>
                  Thử lại
                </Button>
              </div>
            )}
            {!loading && !error && !items.length && (
              <p className="px-3 py-3 text-xs text-muted-foreground">
                {search ? "Không tìm thấy repository." : "Chưa có repository được import."}
              </p>
            )}
            {items.map((repo) => (
              <Link
                key={repo.id}
                href={ROUTES.board(repo.id)}
                onClick={() => setOpen(false)}
                aria-current={repo.id === repoId ? "page" : undefined}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FolderGit2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{repo.fullName}</span>
                {repo.id === repoId && <Check className="ml-auto h-4 w-4 shrink-0" />}
              </Link>
            ))}
          </div>
          <div className="space-y-1 border-t py-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => startAction("create")}
            >
              <Plus className="h-4 w-4" />
              Tạo repo mới
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => startAction("import")}
            >
              <Download className="h-4 w-4" />
              Import repo đã có
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {action === "create" && (
        <CreateRepositoryForm initialOpen hideTrigger onClose={() => setAction(null)} />
      )}
      {action === "import" && (
        <ImportRepositoryDialog initialOpen hideTrigger onClose={() => setAction(null)} />
      )}
    </>
  );
}
