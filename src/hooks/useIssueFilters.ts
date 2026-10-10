"use client";

import { useMemo, useState } from "react";
import { DEFAULT_ISSUE_FILTERS } from "@/constants";
import type { IssueFilters } from "@/types";
import { useDebounce } from "./useDebounce";

/**
 * Quản lý bộ lọc issue.
 * - `filters`: giá trị hiển thị trong các ô nhập.
 * - `appliedFilters`: giá trị dùng để lọc (từ khóa tìm kiếm được debounce).
 */
export function useIssueFilters() {
  const [filters, setFilters] = useState<IssueFilters>(DEFAULT_ISSUE_FILTERS);
  const debouncedSearch = useDebounce(filters.search, 250);

  const appliedFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const resetFilters = () => setFilters(DEFAULT_ISSUE_FILTERS);

  return { filters, appliedFilters, setFilters, resetFilters };
}
