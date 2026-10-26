export interface Repository {
  id: number;
  name: string;
  owner: string;
  /** Dạng "owner/name", ví dụ "huytran/my-project". */
  fullName: string;
  description: string | null;
  isPrivate: boolean;
  /** Đã được kết nối vào hệ thống (đã đồng bộ issue + đăng ký webhook) hay chưa. */
  isConnected: boolean;
  openIssuesCount: number;
  /** Người dùng là owner (admin repo trên GitHub): được kết nối repo và tạo báo cáo AI. */
  canManage: boolean;
}
