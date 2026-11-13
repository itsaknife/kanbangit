"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { RepoTabs } from "./RepoTabs";

const ToolbarContext = createContext<HTMLDivElement | null>(null);
export const useRepositoryToolbar = () => useContext(ToolbarContext);

export function RepositoryWorkspace({ children }: { children: ReactNode }) {
  const [toolbar, setToolbar] = useState<HTMLDivElement | null>(null);
  return (
    <ToolbarContext value={toolbar}>
      <div className="flex min-w-0 flex-col gap-4">
        <RepoTabs toolbarRef={setToolbar} />
        {children}
      </div>
    </ToolbarContext>
  );
}
