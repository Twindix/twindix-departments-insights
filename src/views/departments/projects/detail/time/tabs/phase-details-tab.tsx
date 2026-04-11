import { useMemo } from "react";
import { Filter, Search, X } from "lucide-react";
import { Card, CardContent, Button, Input, Badge } from "@/atoms";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/ui";
import { DataTable, ProgressBar, TablePagination } from "@/components/shared";
import { useTableUrlState } from "@/hooks";
import { formatDate, formatPercentage } from "@/utils";
import type { TimelineData, TimelinePhase } from "@/data/seed";

interface PhaseDetailsTabProps {
    data: TimelineData;
}

const STATUS_VARIANTS: Record<TimelinePhase["status"], "default" | "secondary" | "outline"> = {
    "مكتمل": "default",
    "قيد التنفيذ": "secondary",
    "لم يبدأ": "outline",
};

export function PhaseDetailsTab({ data }: PhaseDetailsTabProps) {
    const url = useTableUrlState({
        prefix: "ph",
        defaultPageSize: 25,
        filterKeys: ["phase", "status"],
    });
    const phaseFilter = url.getFilter("phase");
    const statusFilter = url.getFilter("status");

    const uniquePhases = useMemo(() => Array.from(new Set(data.phases.map((p) => p.name))), [data.phases]);

    const filtered = useMemo(() => {
        const q = url.searchQuery.trim();
        return data.phases.filter((p) => {
            if (q && !String(p.unitNumber).includes(q)) return false;
            if (phaseFilter !== "all" && p.name !== phaseFilter) return false;
            if (statusFilter !== "all" && p.status !== statusFilter) return false;
            return true;
        });
    }, [data.phases, url.searchQuery, phaseFilter, statusFilter]);

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
        { key: "unitNumber", header: "الوحدة", sortable: true, render: (p: TimelinePhase) => <span className="font-medium tabular-nums">{p.unitNumber}</span>, className: "w-20" },
        { key: "sequence", header: "#", sortable: true, render: (p: TimelinePhase) => <span className="tabular-nums">{p.sequence}</span>, className: "w-12 text-end" },
        { key: "name", header: "اسم المرحلة", sortable: true, render: (p: TimelinePhase) => <span className="text-sm">{p.name}</span> },
        { key: "startDate", header: "البداية", sortable: true, render: (p: TimelinePhase) => <span className="text-xs tabular-nums">{formatDate(p.startDate, "short")}</span> },
        { key: "endDate", header: "النهاية", sortable: true, render: (p: TimelinePhase) => <span className="text-xs tabular-nums">{formatDate(p.endDate, "short")}</span> },
        { key: "durationDays", header: "المدة", sortable: true, render: (p: TimelinePhase) => <span className="tabular-nums">{p.durationDays} يوم</span>, className: "text-end" },
        { key: "weight", header: "الوزن", render: (p: TimelinePhase) => <span className="tabular-nums">{formatPercentage(p.weight)}</span>, className: "text-end" },
        { key: "status", header: "الحالة", sortable: true, render: (p: TimelinePhase) => <Badge variant={STATUS_VARIANTS[p.status]}>{p.status}</Badge> },
        { key: "progressPct", header: "التقدم", sortable: true, render: (p: TimelinePhase) => <ProgressBar value={p.progressPct * 100} size="sm" showPercentage label="" className="min-w-[100px]" /> },
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
                    <Input placeholder="بحث برقم الوحدة..." value={url.localSearch} onChange={(e) => url.handleSearchChange(e.target.value)} className="pr-9 h-9 text-sm" />
                </div>
                <Select value={phaseFilter} onValueChange={(v) => url.setFilter("phase", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[200px] text-sm"><SelectValue placeholder="المرحلة" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل المراحل</SelectItem>
                        {uniquePhases.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => url.setFilter("status", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[160px] text-sm"><SelectValue placeholder="الحالة" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        <SelectItem value="مكتمل">مكتمل</SelectItem>
                        <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                        <SelectItem value="لم يبدأ">لم يبدأ</SelectItem>
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
                    <DataTable columns={columns} data={paginated} sortState={url.sortState} onSort={url.handleSort} emptyMessage="لا توجد مراحل مطابقة" />
                    <TablePagination
                        totalItems={sorted.length}
                        pageSize={url.pageSize}
                        currentPage={safePage}
                        onPageChange={url.setCurrentPage}
                        onPageSizeChange={url.setPageSize}
                        pageSizeOptions={[25, 50, 100, 200]}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
