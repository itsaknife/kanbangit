/** Lấy nội dung lỗi để hiển thị cho người dùng. */
export function getErrorMessage(
  error: unknown,
  fallback = "Đã có lỗi xảy ra, vui lòng thử lại",
): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
