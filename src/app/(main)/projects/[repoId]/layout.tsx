import type { ReactNode } from "react";
import { RepositoryWorkspace } from "@/components/layout/RepositoryWorkspace";

// RepoTabs đọc params và tải thông tin repository ở client trước khi render
// phần layout dùng chung, vì vậy segment này không cam kết instant navigation.
export const instant = false;

/** Khung chung cho các trang của một repository: tên repository + thanh tab. */
export default function RepositoryLayout({ children }: { children: ReactNode }) {
  return <RepositoryWorkspace>{children}</RepositoryWorkspace>;
}
