import { useMemo, useCallback, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Filter,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { Card, CardContent, Button, Input, Badge } from "@/atoms";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/ui";
import { DataTable, ProgressBar, type SortDirection, type SortState } from "@/components/shared";
import { formatUsdAsSar, formatNumber } from "@/utils";
import type { CostData, UnitCostItem } from "@/data/seed";

interface UnitsTabProps {
    data: CostData;
    unitTypeLabel: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const STATUS_VARIANTS: Record<UnitCostItem["status"], "default" | "secondary" | "outline"> = {
    "مكتملة": "default",
    "تحت التنفيذ": "secondary",
    "مرحلة مبكرة": "outline",
};

export function UnitsTab({ data, unitTypeLabel }: UnitsTabProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get("u-q") || "";
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const searchDebounce = useRef<ReturnType<typeof setTimeout>>(undefined);
    const statusFilter = searchParams.get("u-status") || "all";
    const modelFilter = searchParams.get("u-model") || "all";
    const currentPage = Number(searchParams.get("u-page")) || 1;
    const pageSize = Number(searchParams.get("u-limit")) || 20;

    const sortState: SortState[] = useMemo(() => {
        const raw = searchParams.get("u-sort") || "";
        if (!raw) return [];
        return raw.split(",").map((s) => {
            const [key, dir] = s.split(":");
            return { key, direction: (dir || "asc") as SortDirection };
        }).filter((s) => s.key && s.direction);
    }, [searchParams]);

    const setParam = useCallback((key: string, value: string, resetPage = true) => {
        setSearchParams((prev) => {
            if (value === "" || value === "all") prev.delete(key);
            else prev.set(key, value);
            if (resetPage && key !== "u-page") prev.set("u-page", "1");
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const handleSearchChange = useCallback((value: string) => {
        setLocalSearch(value);
        clearTimeout(searchDebounce.current);
        searchDebounce.current = setTimeout(() => setParam("u-q", value), 300);
    }, [setParam]);

    const handleSort = useCallback((key: string) => {
        setSearchParams((prev) => {
            const raw = prev.get("u-sort") || "";
            const parts = raw ? raw.split(",").map((s) => { const [k, d] = s.split(":"); return { key: k, dir: d }; }) : [];
            const existing = parts.find((s) => s.key === key);
            let next;
            if (!existing) next = [...parts, { key, dir: "asc" }];
            else if (existing.dir === "asc") next = parts.map((s) => s.key === key ? { ...s, dir: "desc" } : s);
            else next = parts.filter((s) => s.key !== key);
            if (next.length === 0) prev.delete("u-sort");
            else prev.set("u-sort", next.map((s) => `${s.key}:${s.dir}`).join(","));
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const uniqueModels = useMemo(
        () => Array.from(new Set(data.units.map((u) => u.model))),
        [data.units],
    );

    const filtered = useMemo(() => {
        const q = searchQuery.trim();
        return data.units.filter((u) => {
            if (q && !String(u.unitNumber).includes(q) && !u.model.includes(q)) return false;
            if (statusFilter !== "all" && u.status !== statusFilter) return false;
            if (modelFilter !== "all" && u.model !== modelFilter) return false;
            return true;
        });
    }, [data.units, searchQuery, statusFilter, modelFilter]);

    const sorted = useMemo(() => {
        if (sortState.length === 0) return filtered;
        return [...filtered].sort((a, b) => {
            for (const { key, direction } of sortState) {
                if (!direction) continue;
                const mul = direction === "asc" ? 1 : -1;
                const av = (a as unknown as Record<string, unknown>)[key];
                const bv = (b as unknown as Record<string, unknown>)[key];
                if (typeof av === "number" && typeof bv === "number") {
                    if (av !== bv) return (av - bv) * mul;
                } else {
                    const cmp = String(av).localeCompare(String(bv), "ar");
                    if (cmp !== 0) return cmp * mul;
                }
            }
            return 0;
        });
    }, [filtered, sortState]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
    const startIdx = (safePage - 1) * pageSize + 1;
    const endIdx = Math.min(safePage * pageSize, sorted.length);
    const setCurrentPage = (v: number) => setParam("u-page", String(v), false);
    const setPageSize = (v: number) => {
        setSearchParams((prev) => { prev.set("u-limit", String(v)); prev.set("u-page", "1"); return prev; }, { replace: true });
    };

    const hasActive = searchQuery || statusFilter !== "all" || modelFilter !== "all";
    const clearFilters = () => {
        setSearchParams((prev) => {
            prev.delete("u-q");
            prev.delete("u-status");
            prev.delete("u-model");
            prev.set("u-page", "1");
            return prev;
        }, { replace: true });
        setLocalSearch("");
    };

    const columns = [
        {
            key: "unitNumber",
            header: `رقم ${unitTypeLabel}`,
            sortable: true,
            render: (u: UnitCostItem) => <span className="font-medium tabular-nums">{u.unitNumber}</span>,
            className: "w-20",
        },
        {
            key: "model",
            header: "النموذج",
            sortable: true,
            render: (u: UnitCostItem) => (
                <div>
                    <p className="font-medium">{u.model}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] tabular-nums">{u.area} م²</p>
                </div>
            ),
        },
        {
            key: "status",
            header: "الحالة",
            sortable: true,
            render: (u: UnitCostItem) => <Badge variant={STATUS_VARIANTS[u.status]}>{u.status}</Badge>,
        },
        {
            key: "progressPct",
            header: "التقدم",
            sortable: true,
            render: (u: UnitCostItem) => (
                <ProgressBar value={u.progressPct * 100} size="sm" showPercentage label="" className="min-w-[100px]" />
            ),
        },
        {
            key: "plannedBudget",
            header: "الميزانية",
            sortable: true,
            render: (u: UnitCostItem) => <span className="tabular-nums">{formatUsdAsSar(u.plannedBudget, { compact: true })}</span>,
            className: "text-end",
        },
        {
            key: "actualToDate",
            header: "الفعلي",
            sortable: true,
            render: (u: UnitCostItem) => <span className="tabular-nums">{formatUsdAsSar(u.actualToDate, { compact: true })}</span>,
            className: "text-end",
        },
        {
            key: "salePrice",
            header: "سعر البيع",
            sortable: true,
            render: (u: UnitCostItem) => <span className="tabular-nums">{formatUsdAsSar(u.salePrice, { compact: true })}</span>,
            className: "text-end",
        },
        {
            key: "expectedProfit",
            header: "الربح المتوقع",
            sortable: true,
            render: (u: UnitCostItem) => (
                <span className={`tabular-nums font-semibold ${u.expectedProfit > 0 ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}>
                    {formatUsdAsSar(u.expectedProfit, { compact: true })}
                </span>
            ),
            className: "text-end",
        },
        {
            key: "openIssues",
            header: "ملاحظات",
            sortable: true,
            render: (u: UnitCostItem) => <span className="tabular-nums">{formatNumber(u.openIssues)}</span>,
            className: "text-end",
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
                    <Filter className="h-4 w-4" />
                    تصفية
                </div>
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                    <Input
                        placeholder="بحث برقم الوحدة أو النموذج..."
                        value={localSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pr-9 h-9 text-sm"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setParam("u-status", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[160px] text-sm">
                        <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">جميع الحالات</SelectItem>
                        <SelectItem value="مكتملة">مكتملة</SelectItem>
                        <SelectItem value="تحت التنفيذ">تحت التنفيذ</SelectItem>
                        <SelectItem value="مرحلة مبكرة">مرحلة مبكرة</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={modelFilter} onValueChange={(v) => setParam("u-model", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[160px] text-sm">
                        <SelectValue placeholder="النموذج" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">جميع النماذج</SelectItem>
                        {uniqueModels.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {hasActive && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-[var(--color-error)]">
                        <X className="h-3.5 w-3.5" />
                        مسح
                    </Button>
                )}
            </div>

            <Card>
                <CardContent className="p-6">
                    <DataTable
                        columns={columns}
                        data={paginated}
                        sortState={sortState}
                        onSort={handleSort}
                        emptyMessage="لا توجد وحدات مطابقة"
                    />

                    {sorted.length > 0 && (
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[var(--color-border)] pt-3">
                            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                                <span>عرض {startIdx} - {endIdx} من {sorted.length}</span>
                                <span className="text-[var(--color-border)]">|</span>
                                <span>صفوف:</span>
                                <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                                    <SelectTrigger className="h-8 w-[68px] text-xs cursor-pointer">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAGE_SIZE_OPTIONS.map((s) => (
                                            <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage <= 1} onClick={() => setCurrentPage(1)}>
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage <= 1} onClick={() => setCurrentPage(Math.max(1, safePage - 1))}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <span className="px-3 text-sm font-medium tabular-nums">{safePage} / {totalPages}</span>
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage >= totalPages} onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage >= totalPages} onClick={() => setCurrentPage(totalPages)}>
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
