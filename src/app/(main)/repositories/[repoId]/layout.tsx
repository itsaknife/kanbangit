import type { ReactNode } from "react";
import { RepoTabs } from "@/components/layout";

/** Khung chung cho các trang của một repository: tên repository + thanh tab. */
export default function RepositoryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <RepoTabs />
      {children}
    </div>
  );
}
