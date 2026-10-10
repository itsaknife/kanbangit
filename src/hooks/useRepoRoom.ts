"use client";

import { useEffect } from "react";
import { joinRepoRoom } from "@/services";

/** Vào "phòng" socket của repository để nhận cập nhật realtime, tự rời phòng khi không dùng nữa. */
export function useRepoRoom(repoId: number) {
  useEffect(() => joinRepoRoom(repoId), [repoId]);
}
