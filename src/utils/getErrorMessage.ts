/** Lấy nội dung lỗi để hiển thị cho người dùng. */
export function getErrorMessage(
  error: unknown,
  fallback = "Đã có lỗi xảy ra, vui lòng thử lại",
): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
