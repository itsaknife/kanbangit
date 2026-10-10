"use client";

import { useEffect, useState } from "react";

/** Trả về `value` sau khi nó ngừng thay đổi trong `delay` ms (dùng cho ô tìm kiếm). */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
