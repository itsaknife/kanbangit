export interface Repository {
  id: string;
  githubId: string;
  name: string;
  owner: string;
  /** Dạng "owner/name", ví dụ "huytran/my-project". */
  fullName: string;
  description: string | null;
  isPrivate: boolean;
  /** Đã được kết nối vào hệ thống (đã đồng bộ issue + đăng ký webhook) hay chưa. */
  isConnected: boolean;
  openIssuesCount: number;
  /** Quyền Owner nội bộ KanbanGit, độc lập với quyền quản trị trên GitHub. */
  canManage: boolean;
}

export interface AvailableRepository {
  githubId: string;
  fullName: string;
  canManage: boolean;
  isPrivate: boolean;
}

export interface CreateRepositoryPayload {
  name: string;
  description?: string;
  visibility: "PUBLIC" | "PRIVATE";
}

export interface RepositoryMember {
  id: string;
  repositoryId: string;
  githubUserId: string;
  login: string;
  avatarUrl: string | null;
  userId: string | null;
  role: "OWNER" | "MEMBER";
  githubPermission: "ADMIN" | "MAINTAIN" | "WRITE" | "TRIAGE" | "READ" | "UNKNOWN";
  isActive: boolean;
}
