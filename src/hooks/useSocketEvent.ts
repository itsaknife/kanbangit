"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/services";

/** Lắng nghe một sự kiện Socket.io. Handler luôn là bản mới nhất, không cần useCallback. */
export function useSocketEvent<T = unknown>(event: string, handler: (payload: T) => void) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const socket = getSocket();
    const listener = (payload: T) => handlerRef.current(payload);

    socket.on(event, listener);
    return () => {
      socket.off(event, listener);
    };
  }, [event]);
}
