/** Tên các sự kiện Socket.io, phải khớp với backend NestJS. */
export const SOCKET_EVENTS = {
  // Client gửi lên server để vào / rời "phòng" của một repository
  subscribeRepo: "repo:subscribe",
  unsubscribeRepo: "repo:unsubscribe",
  // Server đẩy xuống client khi dữ liệu thay đổi
  issueCreated: "issue:created",
  issueUpdated: "issue:updated",
  issueDeleted: "issue:deleted",
} as const;
