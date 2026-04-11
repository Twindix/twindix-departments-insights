import { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils";

const DEFAULT_PALETTE = [
    "var(--color-primary)",
    "var(--color-success)",
    "var(--color-warning)",
    "var(--color-error)",
    "#a78bfa",
    "#f472b6",
    "#34d399",
    "#fbbf24",
];

export interface BarSegment {
    value: number;
    color?: string;
    name?: string;
}

export interface BarChartItem {
    label: string;
    value?: number;
    segments?: BarSegment[];
    color?: string;
    sublabel?: string;
}

interface BarChartProps {
    data: BarChartItem[];
    orientation?: "horizontal" | "vertical";
    valueFormatter?: (v: number) => string;
    barHeight?: number;
    height?: number;
    className?: string;
    showValues?: boolean;
}

/**
 * Pure-CSS/HTML bar chart. RTL-safe (uses inset-y-0 + right-0 + flex).
 * Supports horizontal/vertical orientation and stacked segments.
 */
export function BarChart({
    data,
    orientation = "horizontal",
    valueFormatter = (v) => v.toLocaleString("ar-EG"),
    barHeight = 28,
    height = 220,
    className,
    showValues = true,
}: BarChartProps) {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const t = requestAnimationFrame(() => setAnimated(true));
        return () => cancelAnimationFrame(t);
    }, []);

    const max = useMemo(() => {
        let m = 0;
        for (const item of data) {
            const total = item.segments
                ? item.segments.reduce((s, seg) => s + seg.value, 0)
                : item.value ?? 0;
            if (total > m) m = total;
        }
        return m || 1;
    }, [data]);

    if (orientation === "horizontal") {
        return (
            <div className={cn("flex flex-col gap-2", className)}>
                {data.map((item, idx) => {
                    const total = item.segments
                        ? item.segments.reduce((s, seg) => s + seg.value, 0)
                        : item.value ?? 0;
                    const widthPct = animated ? (total / max) * 100 : 0;

                    return (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                            <div className="w-36 shrink-0 text-end">
                                <p className="truncate font-medium text-[var(--color-text-primary)]" title={item.label}>
                                    {item.label}
                                </p>
                                {item.sublabel && (
                                    <p className="truncate text-[10px] text-[var(--color-text-muted)]">
                                        {item.sublabel}
                                    </p>
                                )}
                            </div>
                            <div className="relative flex-1" style={{ height: barHeight }}>
                                <div className="absolute inset-0 rounded-md bg-[var(--color-surface)]" />
                                <div
                                    className="absolute inset-y-0 right-0 flex overflow-hidden rounded-md transition-all duration-700 ease-out"
                                    style={{ width: `${widthPct}%` }}
                                >
                                    {item.segments
                                        ? item.segments.map((seg, i) => {
                                            const segPct = total > 0 ? (seg.value / total) * 100 : 0;
                                            return (
                                                <div
                                                    key={i}
                                                    style={{
                                                        width: `${segPct}%`,
                                                        backgroundColor:
                                                            seg.color
                                                            ?? DEFAULT_PALETTE[i % DEFAULT_PALETTE.length],
                                                    }}
                                                    className="h-full"
                                                    title={seg.name ? `${seg.name}: ${valueFormatter(seg.value)}` : undefined}
                                                />
                                            );
                                        })
                                        : (
                                            <div
                                                style={{
                                                    backgroundColor:
                                                        item.color
                                                        ?? DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
                                                }}
                                                className="h-full w-full"
                                            />
                                        )}
                                </div>
                                {showValues && (
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-start ps-2">
                                        <span className="text-xs font-semibold tabular-nums text-[var(--color-text-primary)]">
                                            {valueFormatter(total)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // ── Vertical ──────────────────────────────────────────────────────────
    // The chart and the labels row are split into two siblings with explicit
    // pixel heights. This avoids the % heights collapsing inside flex-col,
    // which is what prevented the previous implementation from rendering.
    const labelsAreaHeight = showValues ? 34 : 20;
    const chartAreaHeight = Math.max(20, height - labelsAreaHeight);

    return (
        <div className={cn("flex flex-col", className)} style={{ height }}>
            <div
                className="flex items-end justify-around gap-2"
                style={{ height: chartAreaHeight }}
            >
                {data.map((item, idx) => {
                    const total = item.segments
                        ? item.segments.reduce((s, seg) => s + seg.value, 0)
                        : item.value ?? 0;
                    const totalPx = animated
                        ? Math.round((total / max) * chartAreaHeight)
                        : 0;

                    return (
                        <div
                            key={idx}
                            className="relative flex min-w-0 flex-1 flex-col-reverse overflow-hidden rounded-t-md transition-all duration-700 ease-out"
                            style={{ height: totalPx }}
                            title={item.label}
                        >
                            {item.segments
                                ? (() => {
                                    const segments = item.segments;
                                    return segments.map((seg, i) => {
                                        const segPx = total > 0
                                            ? Math.round((seg.value / total) * totalPx)
                                            : 0;
                                        return (
                                            <div
                                                key={i}
                                                className="w-full"
                                                style={{
                                                    height: `${segPx}px`,
                                                    backgroundColor:
                                                        seg.color
                                                        ?? DEFAULT_PALETTE[i % DEFAULT_PALETTE.length],
                                                }}
                                                title={
                                                    seg.name
                                                        ? `${seg.name}: ${valueFormatter(seg.value)}`
                                                        : undefined
                                                }
                                            />
                                        );
                                    });
                                })()
                                : (
                                    <div
                                        className="h-full w-full"
                                        style={{
                                            backgroundColor:
                                                item.color
                                                ?? DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
                                        }}
                                    />
                                )}
                        </div>
                    );
                })}
            </div>

            {/* Labels row — value above column label, both centered per column */}
            <div className="mt-1.5 flex justify-around gap-2">
                {data.map((item, idx) => {
                    const total = item.segments
                        ? item.segments.reduce((s, seg) => s + seg.value, 0)
                        : item.value ?? 0;
                    return (
                        <div key={idx} className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
                            {showValues && (
                                <span className="text-[10px] font-semibold tabular-nums text-[var(--color-text-secondary)]">
                                    {valueFormatter(total)}
                                </span>
                            )}
                            <span
                                className="w-full truncate text-center text-[10px] text-[var(--color-text-muted)]"
                                title={item.label}
                            >
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
