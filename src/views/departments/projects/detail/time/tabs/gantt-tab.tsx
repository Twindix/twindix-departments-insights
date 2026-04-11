import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, X, Eye } from "lucide-react";
import { Card, CardContent, Button, Badge } from "@/atoms";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/ui";
import { GanttChart, type GanttUnit, type GanttPhase, TablePagination, ProgressBar } from "@/components/shared";
import { formatDate, formatPercentage } from "@/utils";
import type {
    TimelineData,
    TimelineUnit,
    TimelinePhase,
    TimelinePhaseStatus,
} from "@/data/seed";

interface GanttTabProps {
    data: TimelineData;
}

const PAGE_SIZE = 30;

const PHASE_STATUS_VARIANTS: Record<TimelinePhaseStatus, "default" | "secondary" | "outline"> = {
    "مكتمل": "default",
    "قيد التنفيذ": "secondary",
    "لم يبدأ": "outline",
};

function mapPhaseStatus(status: TimelinePhaseStatus, delayDays: number): GanttPhase["status"] {
    if (status === "مكتمل") return "completed";
    if (status === "لم يبدأ") return "not-started";
    return delayDays > 5 ? "delayed" : "in-progress";
}

export function GanttTab({ data }: GanttTabProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const statusFilter = searchParams.get("g-status") || "all";
    const batchFilter = searchParams.get("g-batch") || "all";
    const currentPage = Number(searchParams.get("g-page")) || 1;

    const [selectedUnit, setSelectedUnit] = useState<TimelineUnit | null>(null);

    const setParam = useCallback((key: string, value: string, resetPage = true) => {
        setSearchParams((prev) => {
            if (value === "" || value === "all") prev.delete(key);
            else prev.set(key, value);
            if (resetPage && key !== "g-page") prev.set("g-page", "1");
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const uniqueBatches = useMemo(
        () => Array.from(new Set(data.units.map((u) => u.batch))).sort((a, b) => a - b),
        [data.units],
    );

    const filteredUnits = useMemo(() => {
        return data.units.filter((u) => {
            if (statusFilter !== "all" && u.currentStatus !== statusFilter) return false;
            if (batchFilter !== "all" && String(u.batch) !== batchFilter) return false;
            return true;
        });
    }, [data.units, statusFilter, batchFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredUnits.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedUnits = filteredUnits.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    // Phases for the visible units only
    const phasesByUnit = useMemo(() => {
        const map = new Map<number, TimelinePhase[]>();
        for (const p of data.phases) {
            const list = map.get(p.unitNumber) ?? [];
            list.push(p);
            map.set(p.unitNumber, list);
        }
        return map;
    }, [data.phases]);

    const ganttUnits: GanttUnit[] = paginatedUnits.map((u) => ({
        id: String(u.unitNumber),
        label: u.name,
        sublabel: `الدفعة ${u.batch} • ${formatPercentage(u.currentProgressPct)}`,
        phases: (phasesByUnit.get(u.unitNumber) ?? []).map((p) => ({
            id: `${p.unitNumber}-${p.sequence}`,
            name: p.name,
            startDate: p.startDate,
            endDate: p.endDate,
            status: mapPhaseStatus(p.status, u.currentDelayDays),
            progressPct: p.progressPct,
        })),
        onClick: () => setSelectedUnit(u),
    }));

    const hasActiveFilters = statusFilter !== "all" || batchFilter !== "all";
    const clearFilters = () => {
        setSearchParams((prev) => {
            prev.delete("g-status");
            prev.delete("g-batch");
            prev.set("g-page", "1");
            return prev;
        }, { replace: true });
    };

    const selectedUnitPhases = selectedUnit ? phasesByUnit.get(selectedUnit.unitNumber) ?? [] : [];

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
                    <Filter className="h-4 w-4" />
                    تصفية
                </div>
                <Select value={statusFilter} onValueChange={(v) => setParam("g-status", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[180px] text-sm"><SelectValue placeholder="الحالة" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        <SelectItem value="مكتمل">مكتمل</SelectItem>
                        <SelectItem value="تحت التنفيذ">تحت التنفيذ</SelectItem>
                        <SelectItem value="مرحلة مبكرة">مرحلة مبكرة</SelectItem>
                        <SelectItem value="متأخر">متأخر</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={batchFilter} onValueChange={(v) => setParam("g-batch", v)}>
                    <SelectTrigger className="h-9 w-full sm:w-[140px] text-sm"><SelectValue placeholder="الدفعة" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل الدفعات</SelectItem>
                        {uniqueBatches.map((b) => <SelectItem key={b} value={String(b)}>الدفعة {b}</SelectItem>)}
                    </SelectContent>
                </Select>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-[var(--color-error)]">
                        <X className="h-3.5 w-3.5" />
                        مسح
                    </Button>
                )}
                <div className="ms-auto text-xs text-[var(--color-text-muted)]">
                    {filteredUnits.length} وحدة • {paginatedUnits.length} في الصفحة الحالية
                </div>
            </div>

            <Card>
                <CardContent className="p-3">
                    {ganttUnits.length === 0 ? (
                        <div className="py-12 text-center text-[var(--color-text-muted)]">لا توجد وحدات للعرض</div>
                    ) : (
                        <GanttChart
                            units={ganttUnits}
                            months={data.monthRange.months}
                            today={new Date("2026-04-10")}
                            renderRowAction={(u) => {
                                const unitNum = Number(u.id);
                                const unit = data.units.find((x) => x.unitNumber === unitNum);
                                if (!unit) return null;
                                return (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedUnit(unit)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                );
                            }}
                        />
                    )}

                    <TablePagination
                        totalItems={filteredUnits.length}
                        pageSize={PAGE_SIZE}
                        currentPage={safePage}
                        onPageChange={(p) => setParam("g-page", String(p), false)}
                        onPageSizeChange={() => undefined}
                        pageSizeOptions={[PAGE_SIZE]}
                    />
                </CardContent>
            </Card>

            <Dialog open={selectedUnit !== null} onOpenChange={(open) => !open && setSelectedUnit(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    {selectedUnit && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedUnit.name}</DialogTitle>
                                <DialogDescription>
                                    الدفعة {selectedUnit.batch} • {selectedUnit.currentStatus}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                                        <p className="text-[10px] text-[var(--color-text-muted)]">البداية</p>
                                        <p className="mt-0.5 text-sm font-semibold tabular-nums">{formatDate(selectedUnit.startDate, "short")}</p>
                                    </div>
                                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                                        <p className="text-[10px] text-[var(--color-text-muted)]">النهاية المخططة</p>
                                        <p className="mt-0.5 text-sm font-semibold tabular-nums">{formatDate(selectedUnit.plannedEndDate, "short")}</p>
                                    </div>
                                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                                        <p className="text-[10px] text-[var(--color-text-muted)]">النهاية المعدلة</p>
                                        <p className="mt-0.5 text-sm font-semibold tabular-nums">
                                            {formatDate(selectedUnit.adjustedEndDate, "short")}
                                            {selectedUnit.currentDelayDays > 0 && (
                                                <span className="ms-1 text-[10px] text-[var(--color-error)]">+{selectedUnit.currentDelayDays}ي</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <ProgressBar
                                    value={selectedUnit.currentProgressPct * 100}
                                    label="نسبة التقدم الحالية"
                                    size="md"
                                />

                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">المراحل</h4>
                                    {selectedUnitPhases.map((p) => (
                                        <div key={p.sequence} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-xs font-bold tabular-nums text-[var(--color-primary)]">
                                                        {p.sequence}
                                                    </span>
                                                    <span className="text-sm font-medium">{p.name}</span>
                                                </div>
                                                <Badge variant={PHASE_STATUS_VARIANTS[p.status]}>{p.status}</Badge>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-[var(--color-text-muted)]">
                                                <span className="tabular-nums">{formatDate(p.startDate, "short")} ← {formatDate(p.endDate, "short")}</span>
                                                <span className="tabular-nums">{p.durationDays} يوم • وزن {formatPercentage(p.weight)}</span>
                                            </div>
                                            <div className="mt-2">
                                                <ProgressBar value={p.progressPct * 100} size="sm" showPercentage label="" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
