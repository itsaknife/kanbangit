import { io, type Socket } from "socket.io-client";
import { env } from "@/config/env";
import { SOCKET_EVENTS } from "@/constants";

let socket: Socket | null = null;

/** Số component đang cần nhận dữ liệu của từng repository (để biết khi nào được rời phòng). */
const roomUsers = new Map<number, number>();

/** Lấy kết nối Socket.io dùng chung cho cả ứng dụng (tạo ở lần gọi đầu tiên). */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(env.socketUrl, { withCredentials: true });
    // Khi mất kết nối rồi nối lại, cần vào lại các phòng đang dùng
    socket.on("connect", () => {
      for (const repoId of roomUsers.keys()) {
        socket?.emit(SOCKET_EVENTS.subscribeRepo, repoId);
      }
    });
  }
  return socket;
}

/** Vào phòng của một repository để nhận cập nhật realtime. Trả về hàm để rời phòng. */
export function joinRepoRoom(repoId: number): () => void {
  const connection = getSocket();
  const users = roomUsers.get(repoId) ?? 0;
  roomUsers.set(repoId, users + 1);
  if (users === 0) connection.emit(SOCKET_EVENTS.subscribeRepo, repoId);

  return () => {
    const remaining = (roomUsers.get(repoId) ?? 1) - 1;
    if (remaining > 0) {
      roomUsers.set(repoId, remaining);
      return;
    }
    roomUsers.delete(repoId);
    connection.emit(SOCKET_EVENTS.unsubscribeRepo, repoId);
  };
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
  roomUsers.clear();
}
