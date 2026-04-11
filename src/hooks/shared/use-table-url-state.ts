import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { SortDirection, SortState } from "@/components/shared";

interface TableUrlStateOptions {
    /**
     * Prefix for all URL params owned by this table.
     * E.g. prefix "ins" produces ?ins-q=, ?ins-page=, ?ins-sort=…
     * Allows multiple tables to coexist on the same view without colliding.
     */
    prefix: string;
    defaultPageSize?: number;
    /** Other filter param names this table uses (without the prefix). */
    filterKeys?: string[];
}

interface TableUrlState {
    searchQuery: string;
    localSearch: string;
    handleSearchChange: (v: string) => void;

    currentPage: number;
    pageSize: number;
    setCurrentPage: (p: number) => void;
    setPageSize: (n: number) => void;

    sortState: SortState[];
    handleSort: (key: string) => void;

    getFilter: (key: string) => string;
    setFilter: (key: string, value: string) => void;
    clearAll: () => void;

    hasActiveFilters: (extraValues?: Array<string | undefined>) => boolean;
}

/**
 * Centralizes the URL-state pattern used across all filterable tables in the
 * project (search, sort, paginate, plus arbitrary single-value filters). Each
 * table on a view uses its own `prefix` so multiple tables coexist.
 */
export function useTableUrlState({
    prefix,
    defaultPageSize = 20,
    filterKeys = [],
}: TableUrlStateOptions): TableUrlState {
    const [searchParams, setSearchParams] = useSearchParams();
    const p = (k: string): string => `${prefix}-${k}`;

    const searchQuery = searchParams.get(p("q")) || "";
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const currentPage = Number(searchParams.get(p("page"))) || 1;
    const pageSize = Number(searchParams.get(p("limit"))) || defaultPageSize;

    const sortState: SortState[] = useMemo(() => {
        const raw = searchParams.get(p("sort")) || "";
        if (!raw) return [];
        return raw
            .split(",")
            .map((s) => {
                const [key, dir] = s.split(":");
                return { key, direction: (dir || "asc") as SortDirection };
            })
            .filter((s) => s.key && s.direction);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, prefix]);

    const setParam = useCallback(
        (key: string, value: string, resetPage = true) => {
            setSearchParams((prev) => {
                const fullKey = `${prefix}-${key}`;
                if (value === "" || value === "all") prev.delete(fullKey);
                else prev.set(fullKey, value);
                if (resetPage && key !== "page") prev.set(`${prefix}-page`, "1");
                return prev;
            }, { replace: true });
        },
        [setSearchParams, prefix],
    );

    const handleSearchChange = useCallback(
        (value: string) => {
            setLocalSearch(value);
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => setParam("q", value), 300);
        },
        [setParam],
    );

    const setCurrentPage = useCallback((v: number) => setParam("page", String(v), false), [setParam]);
    const setPageSize = useCallback(
        (v: number) => {
            setSearchParams((prev) => {
                prev.set(`${prefix}-limit`, String(v));
                prev.set(`${prefix}-page`, "1");
                return prev;
            }, { replace: true });
        },
        [setSearchParams, prefix],
    );

    const handleSort = useCallback(
        (key: string) => {
            setSearchParams((prev) => {
                const sortKey = `${prefix}-sort`;
                const raw = prev.get(sortKey) || "";
                const parts = raw
                    ? raw.split(",").map((s) => {
                        const [k, d] = s.split(":");
                        return { key: k, dir: d };
                    })
                    : [];
                const existing = parts.find((s) => s.key === key);
                let next;
                if (!existing) {
                    next = [...parts, { key, dir: "asc" }];
                } else if (existing.dir === "asc") {
                    next = parts.map((s) => (s.key === key ? { ...s, dir: "desc" } : s));
                } else {
                    next = parts.filter((s) => s.key !== key);
                }
                if (next.length === 0) prev.delete(sortKey);
                else prev.set(sortKey, next.map((s) => `${s.key}:${s.dir}`).join(","));
                return prev;
            }, { replace: true });
        },
        [setSearchParams, prefix],
    );

    const getFilter = useCallback(
        (key: string): string => searchParams.get(p(key)) || "all",
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchParams, prefix],
    );
    const setFilter = useCallback((key: string, value: string) => setParam(key, value), [setParam]);

    const clearAll = useCallback(() => {
        setSearchParams((prev) => {
            prev.delete(`${prefix}-q`);
            for (const k of filterKeys) prev.delete(`${prefix}-${k}`);
            prev.set(`${prefix}-page`, "1");
            return prev;
        }, { replace: true });
        setLocalSearch("");
    }, [setSearchParams, prefix, filterKeys]);

    const hasActiveFilters = useCallback(
        (extraValues: Array<string | undefined> = []): boolean => {
            if (searchQuery) return true;
            for (const k of filterKeys) {
                const v = searchParams.get(`${prefix}-${k}`);
                if (v && v !== "all") return true;
            }
            for (const v of extraValues) {
                if (v && v !== "all") return true;
            }
            return false;
        },
        [searchParams, prefix, filterKeys, searchQuery],
    );

    return {
        searchQuery,
        localSearch,
        handleSearchChange,
        currentPage,
        pageSize,
        setCurrentPage,
        setPageSize,
        sortState,
        handleSort,
        getFilter,
        setFilter,
        clearAll,
        hasActiveFilters,
    };
}
