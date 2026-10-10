/** Thông tin rút gọn của một tài khoản GitHub (người tạo, người được giao...). */
export interface UserSummary {
  login: string;
  avatarUrl: string;
}

/** Người dùng đang đăng nhập vào hệ thống. */
export interface User extends UserSummary {
  id: number;
  name: string | null;
}
