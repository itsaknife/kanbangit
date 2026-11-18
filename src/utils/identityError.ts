/** OAuth callback codes are safe, public error identifiers from the backend. */
export function identityErrorMessage(code: string | null): string | null {
  if (!code) return null;
  switch (code) {
    case "IDENTITY_ALREADY_LINKED":
      return "Phương thức đăng nhập này đã được liên kết với tài khoản KanbanGit hiện tại.";
    case "IDENTITY_OWNED_BY_ANOTHER_USER":
      return "Phương thức đăng nhập này đã liên kết với một tài khoản KanbanGit khác. Hai tài khoản cùng email không tự động được gộp. Nếu trước đây bạn dùng GitHub, hãy đăng nhập bằng GitHub để truy cập các Project của tài khoản cũ.";
    case "PROVIDER_ALREADY_LINKED":
      return "Tài khoản KanbanGit hiện tại đã liên kết với một tài khoản khác của provider này. Hãy kiểm tra Tài khoản kết nối trước khi thử lại.";
    case "ACCOUNT_LINK_REQUIRED":
    case "ACCOUNT_EXISTS_WITH_DIFFERENT_PROVIDER":
      return "Tài khoản KanbanGit đã tồn tại với email này. Vui lòng đăng nhập bằng phương thức hiện tại, sau đó liên kết provider mới trong Cài đặt → Tài khoản kết nối.";
    case "ACCOUNT_EMAIL_VERIFICATION_REQUIRED":
      return "Phiên đăng nhập trước chưa hoàn tất. Hãy chọn Đăng nhập bằng Google hoặc GitHub để bắt đầu lại.";
    case "invalid_state":
      return "Phiên xác thực đã hết hạn hoặc không khớp. Hãy bắt đầu lại từ nút Đăng nhập hoặc Liên kết, sử dụng cùng trình duyệt và địa chỉ ứng dụng.";
    case "session_expired":
      return "Phiên KanbanGit đã hết hạn. Vui lòng đăng nhập lại.";
    default:
      return "Chưa hoàn tất xác thực với Google/GitHub. Hãy thử lại và kiểm tra quyền truy cập đã cấp.";
  }
}
