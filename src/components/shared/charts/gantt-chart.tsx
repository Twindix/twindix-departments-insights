import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/utils";

export interface GanttPhase {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: "completed" | "in-progress" | "not-started" | "delayed";
    progressPct?: number;
}

export interface GanttUnit {
    id: string;
    label: string;
    sublabel?: string;
    phases: GanttPhase[];
    onClick?: () => void;
}

interface GanttChartProps {
    units: GanttUnit[];
    // YYYY-MM strings in chronological order
    months: string[];
    today?: Date;
    className?: string;
    labelColumnWidth?: number;
    rowHeight?: number;
    monthMinWidth?: number;
    renderRowAction?: (unit: GanttUnit) => ReactNode;
}

const STATUS_COLORS: Record<GanttPhase["status"], string> = {
    completed: "var(--color-success)",
    "in-progress": "var(--color-primary)",
    "not-started": "var(--color-surface-active)",
    delayed: "var(--color-error)",
};

const STATUS_LABELS: Record<GanttPhase["status"], string> = {
    completed: "مكتملة",
    "in-progress": "قيد التنفيذ",
    "not-started": "لم تبدأ",
    delayed: "متأخرة",
};

function ymKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Custom RTL-safe Gantt chart.
 * Layout: HTML flex with sticky label column. Phase bars are absolutely
 * positioned within each unit's row using percentage offsets relative to
 * the month range. The today indicator is a vertical bar at the column for
 * the current month.
 */
export function GanttChart({
    units,
    months,
    today = new Date(),
    className,
    labelColumnWidth = 200,
    rowHeight = 44,
    monthMinWidth = 50,
    renderRowAction,
}: GanttChartProps) {
    const [hover, setHover] = useState<{
        x: number;
        y: number;
        phase: GanttPhase;
        unitLabel: string;
    } | null>(null);

    const monthIndexMap = useMemo(() => {
        const m = new Map<string, number>();
        months.forEach((mo, i) => m.set(mo, i));
        return m;
    }, [months]);

    const monthsCount = months.length;

    function phaseRange(phase: GanttPhase): { startPct: number; widthPct: number } | null {
        const startDate = new Date(phase.startDate);
        const endDate = new Date(phase.endDate);
        const startMonthIdx = monthIndexMap.get(ymKey(startDate));
        const endMonthIdx = monthIndexMap.get(ymKey(endDate));
        if (startMonthIdx === undefined || endMonthIdx === undefined) return null;

        // Position fractionally within the month based on day-of-month
        const startInMonth = (startDate.getDate() - 1) / 30;
        const endInMonth = (endDate.getDate() - 1) / 30;
        const startPos = (startMonthIdx + startInMonth) / monthsCount;
        const endPos = (endMonthIdx + 1 + endInMonth) / monthsCount;

        return {
            startPct: Math.max(0, Math.min(1, startPos)),
            widthPct: Math.max(0.005, endPos - startPos),
        };
    }

    // Today indicator position
    const todayKey = ymKey(today);
    const todayMonthIdx = monthIndexMap.get(todayKey);
    let todayPct: number | null = null;
    if (todayMonthIdx !== undefined) {
        const dayOffset = (today.getDate() - 1) / 30;
        todayPct = (todayMonthIdx + dayOffset) / monthsCount;
    }

    const minBodyWidth = monthsCount * monthMinWidth;

    return (
        <div className={cn("rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden", className)}>
            <div className="overflow-x-auto scrollbar-thin">
                <div className="relative inline-block min-w-full" style={{ minWidth: labelColumnWidth + minBodyWidth }}>
                    {/* Header row */}
                    <div className="flex sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                        <div
                            className="sticky right-0 z-30 shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)]"
                            style={{ width: labelColumnWidth }}
                        >
                            الوحدة
                        </div>
                        <div className="flex flex-1" style={{ minWidth: minBodyWidth }}>
                            {months.map((m) => (
                                <div
                                    key={m}
                                    className="flex-1 border-l border-[var(--color-border)] py-2 text-center text-[10px] tabular-nums text-[var(--color-text-muted)]"
                                    style={{ minWidth: monthMinWidth }}
                                >
                                    {m}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Unit rows */}
                    {units.map((unit) => (
                        <div
                            key={unit.id}
                            className={cn(
                                "flex border-b border-[var(--color-border)] last:border-b-0 transition-colors",
                                unit.onClick && "cursor-pointer hover:bg-[var(--color-surface-hover)]",
                            )}
                            style={{ height: rowHeight }}
                            onClick={unit.onClick}
                        >
                            <div
                                className="sticky right-0 z-10 flex shrink-0 items-center justify-between border-l border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs"
                                style={{ width: labelColumnWidth }}
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-[var(--color-text-primary)]">{unit.label}</p>
                                    {unit.sublabel && (
                                        <p className="truncate text-[10px] text-[var(--color-text-muted)]">
                                            {unit.sublabel}
                                        </p>
                                    )}
                                </div>
                                {renderRowAction && (
                                    <div className="ms-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        {renderRowAction(unit)}
                                    </div>
                                )}
                            </div>

                            <div className="relative flex-1" style={{ minWidth: minBodyWidth }}>
                                {/* Phase bars */}
                                {unit.phases.map((phase) => {
                                    const range = phaseRange(phase);
                                    if (!range) return null;
                                    return (
                                        <div
                                            key={phase.id}
                                            className="absolute top-1/2 -translate-y-1/2 rounded-md border border-black/10 cursor-pointer transition-all hover:brightness-110 hover:ring-2 hover:ring-[var(--color-primary)]/50"
                                            style={{
                                                right: `${range.startPct * 100}%`,
                                                width: `${range.widthPct * 100}%`,
                                                height: rowHeight - 16,
                                                backgroundColor: STATUS_COLORS[phase.status],
                                            }}
                                            onMouseEnter={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const containerRect = e.currentTarget.closest(".relative")?.getBoundingClientRect();
                                                if (containerRect) {
                                                    setHover({
                                                        x: rect.left + rect.width / 2 - containerRect.left,
                                                        y: rect.top - containerRect.top,
                                                        phase,
                                                        unitLabel: unit.label,
                                                    });
                                                }
                                            }}
                                            onMouseLeave={() => setHover(null)}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {phase.status === "in-progress" && phase.progressPct !== undefined && (
                                                <div
                                                    className="absolute inset-y-0 right-0 rounded-md bg-white/30"
                                                    style={{ width: `${phase.progressPct * 100}%` }}
                                                />
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Today line */}
                                {todayPct !== null && (
                                    <div
                                        className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-[var(--color-error)]"
                                        style={{ right: `${todayPct * 100}%` }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Today line label (top) */}
                    {todayPct !== null && (
                        <div
                            className="pointer-events-none absolute z-30 -translate-x-1/2 rounded bg-[var(--color-error)] px-1.5 py-0.5 text-[9px] font-bold text-white"
                            style={{
                                top: 4,
                                right: `calc(${todayPct * 100}% * (100% - ${labelColumnWidth}px) / 100% + ${labelColumnWidth}px - ${(todayPct * minBodyWidth)}px - 12px)`,
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Hover tooltip */}
            {hover && (
                <div
                    className="pointer-events-none fixed z-50 max-w-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs shadow-lg"
                    style={{
                        left: hover.x + 16,
                        top: hover.y + 16,
                    }}
                >
                    <p className="text-[10px] text-[var(--color-text-muted)]">{hover.unitLabel}</p>
                    <p className="font-semibold text-[var(--color-text-primary)]">{hover.phase.name}</p>
                    <p className="text-[10px] tabular-nums text-[var(--color-text-secondary)]">
                        {hover.phase.startDate} ← {hover.phase.endDate}
                    </p>
                    <p className="text-[10px]">
                        <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: STATUS_COLORS[hover.phase.status] }} />
                        <span className="ms-1.5">{STATUS_LABELS[hover.phase.status]}</span>
                        {hover.phase.progressPct !== undefined && hover.phase.status === "in-progress" && (
                            <span className="ms-2 tabular-nums">({Math.round(hover.phase.progressPct * 100)}%)</span>
                        )}
                    </p>
                </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[10px]">
                {(Object.keys(STATUS_LABELS) as GanttPhase["status"][]).map((s) => (
                    <div key={s} className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: STATUS_COLORS[s] }} />
                        <span className="text-[var(--color-text-secondary)]">{STATUS_LABELS[s]}</span>
                    </div>
                ))}
                <div className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-px bg-[var(--color-error)]" />
                    <span className="text-[var(--color-text-secondary)]">اليوم</span>
                </div>
            </div>
        </div>
    );
}
