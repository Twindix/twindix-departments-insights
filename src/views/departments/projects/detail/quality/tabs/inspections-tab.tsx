import { useMemo } from "react";
import { Filter, Search, X, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Card, CardContent, Button, Input, Badge } from "@/atoms";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/ui";
import { DataTable, TablePagination } from "@/components/shared";
import { useTableUrlState } from "@/hooks";
import { formatDate } from "@/utils";
import type { QualityData, InspectionItem } from "@/data/seed";

interface InspectionsTabProps {
    data: QualityData;
}

const RESULT_VARIANTS: Record<InspectionItem["result"], "default" | "secondary" | "destructive"> = {
    "مقبول من أول مرة": "default",
    "مقبول بعد إعادة": "secondary",
    "مرفوض": "destructive",
};

const RESULT_ICONS: Record<InspectionItem["result"], typeof CheckCircle2> = {
    "مقبول من أول مرة": CheckCircle2,
    "مقبول بعد إعادة": RotateCcw,
    "مرفوض": XCircle,
};

export function InspectionsTab({ data }: InspectionsTabProps) {
    const url = useTableUrlState({
        prefix: "ins",
        defaultPageSize: 25,
        filterKeys: ["result", "contractor", "sector"],
    });

    const resultFilter = url.getFilter("result");
    const contractorFilter = url.getFilter("contractor");
    const sectorFilter = url.getFilter("sector");

    const uniqueContractors = useMemo(() => Array.from(new Set(data.inspections.map((i) => i.contractor))), [data.inspections]);
    const uniqueSectors = useMemo(() => Array.from(new Set(data.inspections.map((i) => i.sector))), [data.inspections]);

    const filtered = useMemo(() => {
        const q = url.searchQuery.trim();
        return data.inspections.filter((i) => {
            if (q && !i.id.includes(q) && !String(i.unitNumber).includes(q) && !i.item.includes(q)) return false;
            if (resultFilter !== "all" && i.result !== resultFilter) return false;
            if (contractorFilter !== "all" && i.contractor !== contractorFilter) return false;
            if (sectorFilter !== "all" && i.sector !== sectorFilter) return false;
            return true;
        });
    }, [data.inspections, url.searchQuery, resultFilter, contractorFilter, sectorFilter]);

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
        { key: "id", header: "رقم الفحص", sortable: true, render: (i: InspectionItem) => <span className="text-xs font-medium tabular-nums">{i.id}</span>, className: "w-24" },
        { key: "date", header: "التاريخ", sortable: true, render: (i: InspectionItem) => <span className="text-xs tabular-nums">{formatDate(i.date, "short")}</span> },
        { key: "unitNumber", header: "الوحدة", sortable: true, render: (i: InspectionItem) => <span className="tabular-nums">{i.unitNumber}</span>, className: "text-end" },
        { key: "sector", header: "القطاع", sortable: true, render: (i: InspectionItem) => <span className="text-xs">{i.sector}</span> },
        { key: "item", header: "البند المفحوص", render: (i: InspectionItem) => <span className="text-sm">{i.item}</span> },
        { key: "contractor", header: "الجهة المنفذة", render: (i: InspectionItem) => <span className="text-xs">{i.contractor}</span> },
        {
            key: "result",
            header: "النتيجة",
            sortable: true,
            render: (i: InspectionItem) => {
                const Icon = RESULT_ICONS[i.result];
                return (
                    <Badge variant={RESULT_VARIANTS[i.result]} className="gap-1">
                        <Icon className="h-3 w-3" />
                        {i.result}
                    </Badge>
                );
            },
        },
        { key: "repeatCount", header: "إعادات", sortable: true, render: (i: InspectionItem) => <span className="tabular-nums">{i.repeatCount}</span>, className: "text-end w-16" },
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
                    <Input placeholder="بحث برقم الفحص أو الوحدة..." value={url.localSearch} onChange={(e) => url.handleSearchChange(e.target.value)} className="pr-9 h-9 text-sm" />
                </div>
                <Select value={resultFilter} onValueChange={(v) => url.setFilter("result", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[170px] text-sm"><SelectValue placeholder="النتيجة" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل النتائج</SelectItem>
                        <SelectItem value="مقبول من أول مرة">مقبول من أول مرة</SelectItem>
                        <SelectItem value="مقبول بعد إعادة">مقبول بعد إعادة</SelectItem>
                        <SelectItem value="مرفوض">مرفوض</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={contractorFilter} onValueChange={(v) => url.setFilter("contractor", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[180px] text-sm"><SelectValue placeholder="المقاول" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل المقاولين</SelectItem>
                        {uniqueContractors.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={sectorFilter} onValueChange={(v) => url.setFilter("sector", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[140px] text-sm"><SelectValue placeholder="القطاع" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل القطاعات</SelectItem>
                        {uniqueSectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
                    <DataTable columns={columns} data={paginated} sortState={url.sortState} onSort={url.handleSort} emptyMessage="لا توجد فحوصات مطابقة" />
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
