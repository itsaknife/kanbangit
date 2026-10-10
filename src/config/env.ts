/**
 * Biến môi trường dùng ở phía trình duyệt (bắt buộc bắt đầu bằng NEXT_PUBLIC_).
 * Next.js chỉ thay giá trị khi viết nguyên cụm `process.env.NEXT_PUBLIC_...`.
 */
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const env = {
  apiUrl,
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL ?? apiUrl,
} as const;
