import type { ReactNode } from "react";
import { RepoTabs } from "@/components/layout";

// RepoTabs đọc params và tải thông tin repository ở client trước khi render
// phần layout dùng chung, vì vậy segment này không cam kết instant navigation.
export const instant = false;

/** Khung chung cho các trang của một repository: tên repository + thanh tab. */
export default function RepositoryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <RepoTabs />
      {children}
    </div>
  );
}
