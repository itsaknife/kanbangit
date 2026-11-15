"use client";
import { useEffect, useEffectEvent } from "react";
import { useSocketEvent } from "./useSocketEvent";
import { SOCKET_EVENTS } from "@/constants";
export function useCollaborationRefresh(repoId: string, reload: () => void) {
  const refresh = useEffectEvent(reload);
  useSocketEvent<{ repoId: string }>(SOCKET_EVENTS.collaborationChanged, (event) => {
    if (event.repoId === repoId) reload();
  });
  useSocketEvent<{ repoId: string }>(SOCKET_EVENTS.issueUpdated, (event) => {
    if (event.repoId === repoId) reload();
  });
  useSocketEvent("connect", reload);
  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [repoId]);
}
