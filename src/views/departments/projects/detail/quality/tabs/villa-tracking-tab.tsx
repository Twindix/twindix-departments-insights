import { useMemo } from "react";
import { Filter, Search, X } from "lucide-react";
import { Card, CardContent, Button, Input, Badge } from "@/atoms";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/ui";
import { DataTable, ProgressBar, TablePagination } from "@/components/shared";
import { useTableUrlState } from "@/hooks";
import { formatUsdAsSar, formatPercentage, formatDate } from "@/utils";
import type { QualityData, VillaTrackingItem } from "@/data/seed";

interface VillaTrackingTabProps {
    data: QualityData;
    unitTypeLabel: string;
}

const STATUS_VARIANTS: Record<VillaTrackingItem["qualityStatus"], "default" | "secondary" | "destructive"> = {
    "مستقرة": "default",
    "تحت المتابعة": "secondary",
    "حرجة": "destructive",
};

export function VillaTrackingTab({ data, unitTypeLabel }: VillaTrackingTabProps) {
    const url = useTableUrlState({
        prefix: "vt",
        defaultPageSize: 20,
        filterKeys: ["sector", "phase", "status"],
    });

    const sectorFilter = url.getFilter("sector");
    const phaseFilter = url.getFilter("phase");
    const statusFilter = url.getFilter("status");

    const uniqueSectors = useMemo(() => Array.from(new Set(data.villaTracking.map((v) => v.sector))), [data.villaTracking]);
    const uniquePhases = useMemo(() => Array.from(new Set(data.villaTracking.map((v) => v.currentPhase))), [data.villaTracking]);

    const filtered = useMemo(() => {
        const q = url.searchQuery.trim();
        return data.villaTracking.filter((v) => {
            if (q && !String(v.unitNumber).includes(q) && !v.sector.includes(q) && !v.contractor.includes(q)) return false;
            if (sectorFilter !== "all" && v.sector !== sectorFilter) return false;
            if (phaseFilter !== "all" && v.currentPhase !== phaseFilter) return false;
            if (statusFilter !== "all" && v.qualityStatus !== statusFilter) return false;
            return true;
        });
    }, [data.villaTracking, url.searchQuery, sectorFilter, phaseFilter, statusFilter]);

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
        { key: "unitNumber", header: `رقم ${unitTypeLabel}`, sortable: true, render: (v: VillaTrackingItem) => <span className="font-medium tabular-nums">{v.unitNumber}</span>, className: "w-20" },
        { key: "sector", header: "القطاع", sortable: true, render: (v: VillaTrackingItem) => <span>{v.sector}</span> },
        { key: "model", header: "النموذج", sortable: true, render: (v: VillaTrackingItem) => <span className="text-xs">{v.model}</span> },
        { key: "currentPhase", header: "المرحلة", sortable: true, render: (v: VillaTrackingItem) => <Badge variant="outline">{v.currentPhase}</Badge> },
        { key: "progressPct", header: "الإنجاز", sortable: true, render: (v: VillaTrackingItem) => <ProgressBar value={v.progressPct * 100} size="sm" showPercentage label="" className="min-w-[100px]" /> },
        { key: "totalInspections", header: "فحوصات", sortable: true, render: (v: VillaTrackingItem) => <span className="tabular-nums">{v.totalInspections}</span>, className: "text-end" },
        { key: "acceptanceRate", header: "نسبة القبول", sortable: true, render: (v: VillaTrackingItem) => <span className="tabular-nums">{formatPercentage(v.acceptanceRate)}</span>, className: "text-end" },
        { key: "openDefects", header: "عيوب مفتوحة", sortable: true, render: (v: VillaTrackingItem) => <span className={`tabular-nums ${v.openDefects > 2 ? "text-[var(--color-error)]" : ""}`}>{v.openDefects}</span>, className: "text-end" },
        { key: "reworkCostUsd", header: "إعادة العمل", sortable: true, render: (v: VillaTrackingItem) => <span className="tabular-nums">{formatUsdAsSar(v.reworkCostUsd, { compact: true })}</span>, className: "text-end" },
        { key: "qualityStatus", header: "الحالة", sortable: true, render: (v: VillaTrackingItem) => <Badge variant={STATUS_VARIANTS[v.qualityStatus]}>{v.qualityStatus}</Badge> },
        { key: "plannedDeliveryDate", header: "موعد التسليم", render: (v: VillaTrackingItem) => <span className="text-xs tabular-nums">{formatDate(v.plannedDeliveryDate, "short")}</span> },
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
                    <Input placeholder="بحث..." value={url.localSearch} onChange={(e) => url.handleSearchChange(e.target.value)} className="pr-9 h-9 text-sm" />
                </div>
                <Select value={sectorFilter} onValueChange={(v) => url.setFilter("sector", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[140px] text-sm"><SelectValue placeholder="القطاع" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل القطاعات</SelectItem>
                        {uniqueSectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={phaseFilter} onValueChange={(v) => url.setFilter("phase", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[140px] text-sm"><SelectValue placeholder="المرحلة" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل المراحل</SelectItem>
                        {uniquePhases.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => url.setFilter("status", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[140px] text-sm"><SelectValue placeholder="الحالة" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        <SelectItem value="مستقرة">مستقرة</SelectItem>
                        <SelectItem value="تحت المتابعة">تحت المتابعة</SelectItem>
                        <SelectItem value="حرجة">حرجة</SelectItem>
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
