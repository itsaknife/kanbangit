"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  /** Khóa của bộ tham số (deps) mà dữ liệu này thuộc về. */
  depsKey: string;
  data?: T;
  error?: unknown;
}

/**
 * Hook gọi dữ liệu bất đồng bộ dùng chung cho các hook theo module.
 *
 * - Tự gọi lại khi `deps` thay đổi (deps chỉ nên chứa giá trị đơn giản: số, chuỗi...).
 * - `loading` chỉ bật khi deps đổi hoặc lần tải đầu; `reload()` làm mới ngầm, giữ nguyên dữ liệu cũ.
 * - `setData` dùng để cập nhật cục bộ (optimistic update, nhận dữ liệu từ socket).
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: readonly unknown[]) {
  const depsKey = JSON.stringify(deps);
  const [state, setState] = useState<AsyncState<T>>({ depsKey: "" });
  const [reloadCount, setReloadCount] = useState(0);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let cancelled = false;

    fetcherRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ depsKey, data });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState((prev) => ({
          depsKey,
          data: prev.depsKey === depsKey ? prev.data : undefined,
          error,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [depsKey, reloadCount]);

  const setData = useCallback((updater: (prev: T | undefined) => T | undefined) => {
    setState((prev) => ({ ...prev, data: updater(prev.data) }));
  }, []);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  const isCurrent = state.depsKey === depsKey;

  return {
    data: isCurrent ? state.data : undefined,
    error: isCurrent ? state.error : undefined,
    loading: !isCurrent,
    reload,
    setData,
  };
}
