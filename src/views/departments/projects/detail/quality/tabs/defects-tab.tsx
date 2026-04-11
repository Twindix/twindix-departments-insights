import { useMemo } from "react";
import { Filter, Search, X } from "lucide-react";
import { Card, CardContent, Button, Input, Badge } from "@/atoms";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/ui";
import { DataTable, TablePagination, DonutChart } from "@/components/shared";
import { useTableUrlState } from "@/hooks";
import { formatUsdAsSar, formatDate } from "@/utils";
import type { QualityData, DefectItem } from "@/data/seed";

interface DefectsTabProps {
    data: QualityData;
}

const SEVERITY_VARIANTS: Record<DefectItem["severity"], "default" | "secondary" | "outline" | "destructive"> = {
    "منخفض": "outline",
    "متوسط": "secondary",
    "عال": "default",
    "حرج": "destructive",
};

const SEVERITY_COLORS: Record<DefectItem["severity"], string> = {
    "منخفض": "var(--color-success)",
    "متوسط": "var(--color-warning)",
    "عال": "#fb923c",
    "حرج": "var(--color-error)",
};

export function DefectsTab({ data }: DefectsTabProps) {
    const url = useTableUrlState({
        prefix: "def",
        defaultPageSize: 25,
        filterKeys: ["severity", "status", "discipline", "sector"],
    });

    const severityFilter = url.getFilter("severity");
    const statusFilter = url.getFilter("status");
    const disciplineFilter = url.getFilter("discipline");
    const sectorFilter = url.getFilter("sector");

    const uniqueDisciplines = useMemo(() => Array.from(new Set(data.defects.map((d) => d.discipline))), [data.defects]);
    const uniqueSectors = useMemo(() => Array.from(new Set(data.defects.map((d) => d.sector))), [data.defects]);

    const filtered = useMemo(() => {
        const q = url.searchQuery.trim();
        return data.defects.filter((d) => {
            if (q && !d.id.includes(q) && !String(d.unitNumber).includes(q) && !d.description.includes(q)) return false;
            if (severityFilter !== "all" && d.severity !== severityFilter) return false;
            if (statusFilter !== "all" && d.status !== statusFilter) return false;
            if (disciplineFilter !== "all" && d.discipline !== disciplineFilter) return false;
            if (sectorFilter !== "all" && d.sector !== sectorFilter) return false;
            return true;
        });
    }, [data.defects, url.searchQuery, severityFilter, statusFilter, disciplineFilter, sectorFilter]);

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
                    const cmp = String(av ?? "").localeCompare(String(bv ?? ""), "ar");
                    if (cmp !== 0) return cmp * mul;
                }
            }
            return 0;
        });
    }, [filtered, url.sortState]);

    const safePage = Math.min(url.currentPage, Math.max(1, Math.ceil(sorted.length / url.pageSize)));
    const paginated = sorted.slice((safePage - 1) * url.pageSize, safePage * url.pageSize);

    const severityCounts = useMemo(() => {
        const counts: Record<DefectItem["severity"], number> = { "منخفض": 0, "متوسط": 0, "عال": 0, "حرج": 0 };
        for (const d of data.defects) counts[d.severity]++;
        return counts;
    }, [data.defects]);

    const totalRework = useMemo(() => data.defects.reduce((s, d) => s + d.reworkCostUsd, 0), [data.defects]);

    const columns = [
        { key: "id", header: "رقم العيب", sortable: true, render: (d: DefectItem) => <span className="text-xs font-medium tabular-nums">{d.id}</span>, className: "w-24" },
        { key: "date", header: "تاريخ الرصد", sortable: true, render: (d: DefectItem) => <span className="text-xs tabular-nums">{formatDate(d.date, "short")}</span> },
        { key: "unitNumber", header: "الوحدة", sortable: true, render: (d: DefectItem) => <span className="tabular-nums">{d.unitNumber}</span>, className: "text-end" },
        { key: "discipline", header: "التخصص", sortable: true, render: (d: DefectItem) => <Badge variant="outline">{d.discipline}</Badge> },
        { key: "description", header: "الوصف", render: (d: DefectItem) => <span className="text-xs text-[var(--color-text-secondary)]">{d.description}</span> },
        { key: "severity", header: "الخطورة", sortable: true, render: (d: DefectItem) => <Badge variant={SEVERITY_VARIANTS[d.severity]}>{d.severity}</Badge> },
        { key: "status", header: "الحالة", sortable: true, render: (d: DefectItem) => <Badge variant={d.status === "مغلق" ? "default" : "destructive"}>{d.status}</Badge> },
        { key: "daysToClose", header: "أيام الإغلاق", sortable: true, render: (d: DefectItem) => <span className="tabular-nums">{d.daysToClose ?? "-"}</span>, className: "text-end" },
        { key: "reworkCostUsd", header: "تكلفة الإعادة", sortable: true, render: (d: DefectItem) => <span className="tabular-nums">{formatUsdAsSar(d.reworkCostUsd, { compact: true })}</span>, className: "text-end" },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardContent className="p-6">
                        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                            توزيع العيوب حسب الخطورة
                        </h3>
                        <DonutChart
                            data={(Object.keys(severityCounts) as DefectItem["severity"][]).map((s) => ({
                                label: s,
                                value: severityCounts[s],
                                color: SEVERITY_COLORS[s],
                            }))}
                            centerValue={String(data.defects.length)}
                            centerLabel="إجمالي العيوب"
                            size={200}
                            thickness={42}
                            valueFormatter={(v) => `${v} عيب`}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="space-y-3 p-6">
                        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">إجمالي تكلفة إعادة العمل</h3>
                        <p className="text-3xl font-bold tabular-nums text-[var(--color-error)]">
                            {formatUsdAsSar(totalRework, { compact: true })}
                        </p>
                        <div className="space-y-2 text-xs text-[var(--color-text-muted)]">
                            <p>عيوب مفتوحة: <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">{data.defects.filter(d => d.status === "مفتوح").length}</span></p>
                            <p>عيوب مغلقة: <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">{data.defects.filter(d => d.status === "مغلق").length}</span></p>
                            <p>عيوب حرجة: <span className="font-semibold text-[var(--color-error)] tabular-nums">{severityCounts["حرج"]}</span></p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
                    <Filter className="h-4 w-4" />
                    تصفية
                </div>
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                    <Input placeholder="بحث برقم العيب أو الوصف..." value={url.localSearch} onChange={(e) => url.handleSearchChange(e.target.value)} className="pr-9 h-9 text-sm" />
                </div>
                <Select value={severityFilter} onValueChange={(v) => url.setFilter("severity", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[140px] text-sm"><SelectValue placeholder="الخطورة" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل الدرجات</SelectItem>
                        <SelectItem value="منخفض">منخفض</SelectItem>
                        <SelectItem value="متوسط">متوسط</SelectItem>
                        <SelectItem value="عال">عال</SelectItem>
                        <SelectItem value="حرج">حرج</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => url.setFilter("status", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[140px] text-sm"><SelectValue placeholder="الحالة" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        <SelectItem value="مفتوح">مفتوح</SelectItem>
                        <SelectItem value="مغلق">مغلق</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={disciplineFilter} onValueChange={(v) => url.setFilter("discipline", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[160px] text-sm"><SelectValue placeholder="التخصص" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل التخصصات</SelectItem>
                        {uniqueDisciplines.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
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
                    <DataTable columns={columns} data={paginated} sortState={url.sortState} onSort={url.handleSort} emptyMessage="لا توجد عيوب مطابقة" />
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
