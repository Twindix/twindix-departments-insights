import { useMemo } from "react";
import { Filter, Search, X } from "lucide-react";
import { Card, CardContent, Button, Input, Badge } from "@/atoms";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/ui";
import { DataTable, TablePagination, ProgressBar } from "@/components/shared";
import { useTableUrlState } from "@/hooks";
import { formatPercentage, formatDate } from "@/utils";
import type { QualityData, HandoverItem } from "@/data/seed";

interface HandoverTabProps {
    data: QualityData;
    unitTypeLabel: string;
}

const STATUS_VARIANTS: Record<HandoverItem["deliveryStatus"], "default" | "secondary" | "outline" | "destructive"> = {
    "غير جاهزة": "destructive",
    "قيد التجهيز": "outline",
    "جاهزة للاستلام الابتدائي": "secondary",
    "مستلمة ابتدائيًا": "default",
};

export function HandoverTab({ data, unitTypeLabel }: HandoverTabProps) {
    const url = useTableUrlState({
        prefix: "ho",
        defaultPageSize: 20,
        filterKeys: ["sector", "status"],
    });

    const sectorFilter = url.getFilter("sector");
    const statusFilter = url.getFilter("status");

    const uniqueSectors = useMemo(() => Array.from(new Set(data.handover.map((h) => h.sector))), [data.handover]);

    const filtered = useMemo(() => {
        const q = url.searchQuery.trim();
        return data.handover.filter((h) => {
            if (q && !String(h.unitNumber).includes(q)) return false;
            if (sectorFilter !== "all" && h.sector !== sectorFilter) return false;
            if (statusFilter !== "all" && h.deliveryStatus !== statusFilter) return false;
            return true;
        });
    }, [data.handover, url.searchQuery, sectorFilter, statusFilter]);

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
        { key: "unitNumber", header: `رقم ${unitTypeLabel}`, sortable: true, render: (h: HandoverItem) => <span className="font-medium tabular-nums">{h.unitNumber}</span>, className: "w-20" },
        { key: "sector", header: "القطاع", sortable: true, render: (h: HandoverItem) => <span>{h.sector}</span> },
        { key: "currentPhase", header: "المرحلة", render: (h: HandoverItem) => <Badge variant="outline">{h.currentPhase}</Badge> },
        { key: "progressPct", header: "الإنجاز", sortable: true, render: (h: HandoverItem) => <ProgressBar value={h.progressPct * 100} size="sm" showPercentage label="" className="min-w-[100px]" /> },
        { key: "openDefects", header: "عيوب مفتوحة", sortable: true, render: (h: HandoverItem) => <span className="tabular-nums">{h.openDefects}</span>, className: "text-end" },
        { key: "docsReadiness", header: "جاهزية الوثائق", sortable: true, render: (h: HandoverItem) => <span className="tabular-nums">{formatPercentage(h.docsReadiness)}</span>, className: "text-end" },
        { key: "systemsReadiness", header: "جاهزية الأنظمة", sortable: true, render: (h: HandoverItem) => <span className="tabular-nums">{formatPercentage(h.systemsReadiness)}</span>, className: "text-end" },
        { key: "deliveryStatus", header: "حالة التسليم", sortable: true, render: (h: HandoverItem) => <Badge variant={STATUS_VARIANTS[h.deliveryStatus]}>{h.deliveryStatus}</Badge> },
        { key: "plannedDelivery", header: "التسليم المخطط", render: (h: HandoverItem) => <span className="text-xs tabular-nums">{formatDate(h.plannedDelivery, "short")}</span> },
        { key: "expectedDelivery", header: "التسليم المتوقع", render: (h: HandoverItem) => <span className="text-xs tabular-nums">{formatDate(h.expectedDelivery, "short")}</span> },
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
                    <Input placeholder={`بحث برقم ${unitTypeLabel}...`} value={url.localSearch} onChange={(e) => url.handleSearchChange(e.target.value)} className="pr-9 h-9 text-sm" />
                </div>
                <Select value={sectorFilter} onValueChange={(v) => url.setFilter("sector", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[140px] text-sm"><SelectValue placeholder="القطاع" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل القطاعات</SelectItem>
                        {uniqueSectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => url.setFilter("status", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[200px] text-sm"><SelectValue placeholder="حالة التسليم" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        <SelectItem value="غير جاهزة">غير جاهزة</SelectItem>
                        <SelectItem value="قيد التجهيز">قيد التجهيز</SelectItem>
                        <SelectItem value="جاهزة للاستلام الابتدائي">جاهزة للاستلام الابتدائي</SelectItem>
                        <SelectItem value="مستلمة ابتدائيًا">مستلمة ابتدائيًا</SelectItem>
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
                    <DataTable columns={columns} data={paginated} sortState={url.sortState} onSort={url.handleSort} emptyMessage="لا توجد بيانات تسليم" />
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
