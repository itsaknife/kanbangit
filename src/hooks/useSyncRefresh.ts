"use client";
import { useEffect, useEffectEvent } from "react";
import { useRepoRoom } from "./useRepoRoom";
import { useSocketEvent } from "./useSocketEvent";
import { SOCKET_EVENTS } from "@/constants";
export function useSyncRefresh(repoId: string, reload: () => void) {
  const refresh = useEffectEvent(reload);
  useRepoRoom(repoId);
  useSocketEvent<{ repoId: string }>(SOCKET_EVENTS.issueUpdated, (event) => {
    if (event.repoId === repoId) reload();
  });
  useSocketEvent("connect", reload);
  useEffect(() => {
    refresh();
    const run = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const timer = window.setInterval(run, 20000);
    window.addEventListener("focus", run);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", run);
    };
  }, [repoId, reload]);
}
