/** Thông tin rút gọn của một tài khoản GitHub (người tạo, người được giao...). */
export interface UserSummary {
  login: string;
  avatarUrl: string;
}

/** Người dùng đang đăng nhập vào hệ thống. */
export interface IssueAssignee extends UserSummary {
  id: string;
}

export interface User extends UserSummary {
  id: string;
  name: string | null;
  displayName: string | null;
  customAvatarUrl: string | null;
}
