import { useMemo } from "react";
import { Filter, Search, X } from "lucide-react";
import { Card, CardContent, Button, Input, Badge } from "@/atoms";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/ui";
import { DataTable, ProgressBar, TablePagination } from "@/components/shared";
import { useTableUrlState } from "@/hooks";
import { formatDate, formatPercentage } from "@/utils";
import type { TimelineData, TimelineUnit } from "@/data/seed";

interface MainScheduleTabProps {
    data: TimelineData;
}

const STATUS_VARIANTS: Record<TimelineUnit["currentStatus"], "default" | "secondary" | "outline" | "destructive"> = {
    "مكتمل": "default",
    "تحت التنفيذ": "secondary",
    "مرحلة مبكرة": "outline",
    "متأخر": "destructive",
};

const RISK_VARIANTS: Record<TimelineUnit["riskLevel"], "default" | "outline" | "destructive"> = {
    "منخفض": "default",
    "متوسط": "outline",
    "مرتفع": "destructive",
};

export function MainScheduleTab({ data }: MainScheduleTabProps) {
    const url = useTableUrlState({
        prefix: "ms",
        defaultPageSize: 20,
        filterKeys: ["status", "batch", "risk"],
    });
    const statusFilter = url.getFilter("status");
    const batchFilter = url.getFilter("batch");
    const riskFilter = url.getFilter("risk");

    const uniqueBatches = useMemo(
        () => Array.from(new Set(data.units.map((u) => u.batch))).sort((a, b) => a - b),
        [data.units],
    );

    const filtered = useMemo(() => {
        const q = url.searchQuery.trim();
        return data.units.filter((u) => {
            if (q && !u.name.includes(q) && !String(u.unitNumber).includes(q)) return false;
            if (statusFilter !== "all" && u.currentStatus !== statusFilter) return false;
            if (batchFilter !== "all" && String(u.batch) !== batchFilter) return false;
            if (riskFilter !== "all" && u.riskLevel !== riskFilter) return false;
            return true;
        });
    }, [data.units, url.searchQuery, statusFilter, batchFilter, riskFilter]);

    const sorted = useMemo(() => {
        if (url.sortState.length === 0) return filtered;
        return [...filtered].sort((a, b) => {
            for (const { key, direction } of url.sortState) {
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
    }, [filtered, url.sortState]);

    const safePage = Math.min(url.currentPage, Math.max(1, Math.ceil(sorted.length / url.pageSize)));
    const paginated = sorted.slice((safePage - 1) * url.pageSize, safePage * url.pageSize);

    const columns = [
        { key: "name", header: "اسم الوحدة", sortable: true, render: (u: TimelineUnit) => <span className="font-medium">{u.name}</span> },
        { key: "batch", header: "الدفعة", sortable: true, render: (u: TimelineUnit) => <span className="tabular-nums">{u.batch}</span>, className: "text-end w-16" },
        { key: "currentStatus", header: "الحالة", sortable: true, render: (u: TimelineUnit) => <Badge variant={STATUS_VARIANTS[u.currentStatus]}>{u.currentStatus}</Badge> },
        { key: "startDate", header: "البداية", sortable: true, render: (u: TimelineUnit) => <span className="text-xs tabular-nums">{formatDate(u.startDate, "short")}</span> },
        { key: "plannedEndDate", header: "النهاية المخططة", sortable: true, render: (u: TimelineUnit) => <span className="text-xs tabular-nums">{formatDate(u.plannedEndDate, "short")}</span> },
        { key: "adjustedEndDate", header: "النهاية المعدلة", sortable: true, render: (u: TimelineUnit) => <span className="text-xs tabular-nums">{formatDate(u.adjustedEndDate, "short")}</span> },
        { key: "plannedDurationDays", header: "المدة (يوم)", sortable: true, render: (u: TimelineUnit) => <span className="tabular-nums">{u.plannedDurationDays}</span>, className: "text-end" },
        {
            key: "currentDelayDays",
            header: "التأخير",
            sortable: true,
            render: (u: TimelineUnit) => (
                <span className={`tabular-nums ${u.currentDelayDays > 15 ? "text-[var(--color-error)]" : u.currentDelayDays > 5 ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"}`}>
                    {u.currentDelayDays} يوم
                </span>
            ),
            className: "text-end",
        },
        {
            key: "currentProgressPct",
            header: "التقدم",
            sortable: true,
            render: (u: TimelineUnit) => <ProgressBar value={u.currentProgressPct * 100} size="sm" showPercentage label="" className="min-w-[100px]" />,
        },
        { key: "currentPhase", header: "المرحلة الحالية", render: (u: TimelineUnit) => <span className="text-xs">{u.currentPhase}</span> },
        { key: "riskLevel", header: "المخاطر الزمنية", sortable: true, render: (u: TimelineUnit) => <Badge variant={RISK_VARIANTS[u.riskLevel]}>{u.riskLevel}</Badge> },
    ];

    void formatPercentage; // unused but kept available

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
                    <Filter className="h-4 w-4" />
                    تصفية
                </div>
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                    <Input placeholder="بحث باسم أو رقم الوحدة..." value={url.localSearch} onChange={(e) => url.handleSearchChange(e.target.value)} className="pr-9 h-9 text-sm" />
                </div>
                <Select value={statusFilter} onValueChange={(v) => url.setFilter("status", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[160px] text-sm"><SelectValue placeholder="الحالة" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        <SelectItem value="مكتمل">مكتمل</SelectItem>
                        <SelectItem value="تحت التنفيذ">تحت التنفيذ</SelectItem>
                        <SelectItem value="مرحلة مبكرة">مرحلة مبكرة</SelectItem>
                        <SelectItem value="متأخر">متأخر</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={batchFilter} onValueChange={(v) => url.setFilter("batch", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[140px] text-sm"><SelectValue placeholder="الدفعة" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل الدفعات</SelectItem>
                        {uniqueBatches.map((b) => <SelectItem key={b} value={String(b)}>الدفعة {b}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={(v) => url.setFilter("risk", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[140px] text-sm"><SelectValue placeholder="المخاطر" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل الدرجات</SelectItem>
                        <SelectItem value="منخفض">منخفض</SelectItem>
                        <SelectItem value="متوسط">متوسط</SelectItem>
                        <SelectItem value="مرتفع">مرتفع</SelectItem>
                    </SelectContent>
                </Select>
                {url.hasActiveFilters() && (
                    <Button variant="ghost" size="sm" onClick={url.clearAll} className="gap-1 text-[var(--color-error)]">
                        <X className="h-3.5 w-3.5" />
                        مسح
                    </Button>
                )}
            </div>

            <Card>
                <CardContent className="p-6">
                    <DataTable columns={columns} data={paginated} sortState={url.sortState} onSort={url.handleSort} emptyMessage="لا توجد وحدات مطابقة" />
                    <TablePagination
                        totalItems={sorted.length}
                        pageSize={url.pageSize}
                        currentPage={safePage}
                        onPageChange={url.setCurrentPage}
                        onPageSizeChange={url.setPageSize}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
