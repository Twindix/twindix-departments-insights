import { useState, type MouseEvent } from "react";
import { cn } from "@/utils";
import { useChartSize } from "./use-chart-size";
import { useMountAnimation } from "./use-mount-animation";
import { ChartTooltip } from "./chart-tooltip";
import { ChartLegend } from "./chart-legend";

export interface LineSeries {
    name: string;
    color: string;
    points: number[];
}

interface LineChartProps {
    series: LineSeries[];
    xLabels: string[];
    valueFormatter?: (v: number) => string;
    height?: number;
    className?: string;
    fill?: boolean;
    smooth?: boolean;
    showLegend?: boolean;
}

const PADDING = { top: 16, right: 16, bottom: 28, left: 48 };

/**
 * SVG line / area chart with multi-series support, hover crosshair,
 * mount-in animation via stroke-dashoffset, and 5-tick Y axis.
 */
export function LineChart({
    series,
    xLabels,
    valueFormatter = (v) => v.toLocaleString("ar-EG"),
    height = 240,
    className,
    fill = false,
    smooth = true,
    showLegend = true,
}: LineChartProps) {
    const [containerRef, { width }] = useChartSize<HTMLDivElement>();
    const progress = useMountAnimation(900);
    const [hover, setHover] = useState<{ idx: number; x: number; y: number } | null>(null);

    const chartW = Math.max(0, width - PADDING.left - PADDING.right);
    const chartH = Math.max(0, height - PADDING.top - PADDING.bottom);

    let min = Infinity;
    let max = -Infinity;
    for (const s of series) {
        for (const p of s.points) {
            if (p < min) min = p;
            if (p > max) max = p;
        }
    }
    if (!isFinite(min) || !isFinite(max)) {
        min = 0;
        max = 1;
    }
    if (min === max) {
        max = min + 1;
    }
    // Slight padding so the curve doesn't touch the top
    const yPad = (max - min) * 0.08;
    const yMin = min - yPad;
    const yMax = max + yPad;
    const range = yMax - yMin;

    const xPos = (i: number): number => {
        const n = xLabels.length;
        if (n <= 1) return chartW / 2;
        return (i / (n - 1)) * chartW;
    };
    const yPos = (v: number): number => chartH - ((v - yMin) / range) * chartH;

    const buildPath = (points: number[]): string => {
        if (points.length === 0) return "";
        let d = `M ${xPos(0).toFixed(2)} ${yPos(points[0]).toFixed(2)}`;
        for (let i = 1; i < points.length; i++) {
            const px = xPos(i);
            const py = yPos(points[i]);
            if (smooth) {
                const prevX = xPos(i - 1);
                const prevY = yPos(points[i - 1]);
                const cp1x = prevX + (px - prevX) / 2;
                const cp1y = prevY;
                const cp2x = prevX + (px - prevX) / 2;
                const cp2y = py;
                d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${px.toFixed(2)} ${py.toFixed(2)}`;
            } else {
                d += ` L ${px.toFixed(2)} ${py.toFixed(2)}`;
            }
        }
        return d;
    };

    const buildAreaPath = (points: number[]): string => {
        const linePath = buildPath(points);
        if (!linePath) return "";
        const lastX = xPos(points.length - 1);
        return `${linePath} L ${lastX.toFixed(2)} ${chartH} L 0 ${chartH} Z`;
    };

    // Y-axis ticks
    const ticks: { value: number; y: number }[] = [];
    for (let i = 0; i <= 4; i++) {
        const v = yMin + (range * i) / 4;
        ticks.push({ value: v, y: yPos(v) });
    }

    // X-axis labels — show subset
    const xEveryN = Math.max(1, Math.ceil(xLabels.length / 7));

    const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = e.clientX - rect.left - PADDING.left;
        if (px < 0 || px > chartW) {
            setHover(null);
            return;
        }
        const n = xLabels.length;
        if (n <= 1) return;
        const idx = Math.round((px / chartW) * (n - 1));
        const clampedIdx = Math.max(0, Math.min(n - 1, idx));
        setHover({
            idx: clampedIdx,
            x: xPos(clampedIdx) + PADDING.left,
            y: PADDING.top,
        });
    };

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            {width > 0 && (
                <svg
                    width={width}
                    height={height}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHover(null)}
                    className="overflow-visible"
                >
                    <g transform={`translate(${PADDING.left},${PADDING.top})`}>
                        {/* Horizontal grid lines */}
                        {ticks.map((t, i) => (
                            <line
                                key={`grid-${i}`}
                                x1={0}
                                x2={chartW}
                                y1={t.y}
                                y2={t.y}
                                stroke="var(--color-border)"
                                strokeWidth={1}
                                strokeDasharray="2 4"
                                opacity={0.6}
                            />
                        ))}

                        {/* Y axis labels */}
                        {ticks.map((t, i) => (
                            <text
                                key={`yl-${i}`}
                                x={-8}
                                y={t.y + 3}
                                textAnchor="end"
                                fontSize={10}
                                fill="var(--color-text-muted)"
                                className="tabular-nums"
                            >
                                {valueFormatter(t.value)}
                            </text>
                        ))}

                        {/* X axis labels */}
                        {xLabels.map((label, i) => {
                            if (i % xEveryN !== 0 && i !== xLabels.length - 1) return null;
                            return (
                                <text
                                    key={`xl-${i}`}
                                    x={xPos(i)}
                                    y={chartH + 18}
                                    textAnchor="middle"
                                    fontSize={10}
                                    fill="var(--color-text-muted)"
                                    className="tabular-nums"
                                >
                                    {label}
                                </text>
                            );
                        })}

                        {/* Areas */}
                        {fill && series.map((s, i) => (
                            <path
                                key={`area-${i}`}
                                d={buildAreaPath(s.points)}
                                fill={s.color}
                                fillOpacity={0.18 * progress}
                            />
                        ))}

                        {/* Lines */}
                        {series.map((s, i) => (
                            <path
                                key={`line-${i}`}
                                d={buildPath(s.points)}
                                fill="none"
                                stroke={s.color}
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    strokeDasharray: 3000,
                                    strokeDashoffset: 3000 * (1 - progress),
                                }}
                            />
                        ))}

                        {/* Hover crosshair */}
                        {hover && (
                            <>
                                <line
                                    x1={xPos(hover.idx)}
                                    x2={xPos(hover.idx)}
                                    y1={0}
                                    y2={chartH}
                                    stroke="var(--color-text-muted)"
                                    strokeWidth={1}
                                    strokeDasharray="2 4"
                                />
                                {series.map((s, i) => (
                                    <circle
                                        key={`hover-${i}`}
                                        cx={xPos(hover.idx)}
                                        cy={yPos(s.points[hover.idx])}
                                        r={4}
                                        fill={s.color}
                                        stroke="var(--color-bg)"
                                        strokeWidth={2}
                                    />
                                ))}
                            </>
                        )}
                    </g>
                </svg>
            )}

            {hover && (
                <ChartTooltip x={hover.x} y={hover.y} visible={true}>
                    <div className="space-y-1">
                        <p className="mb-1 text-[10px] text-[var(--color-text-muted)]">
                            {xLabels[hover.idx]}
                        </p>
                        {series.map((s, i) => (
                            <div key={`tt-${i}`} className="flex items-center gap-2">
                                <span
                                    className="inline-block h-2 w-2 rounded-sm"
                                    style={{ backgroundColor: s.color }}
                                />
                                <span className="text-[var(--color-text-secondary)]">{s.name}</span>
                                <span className="font-semibold tabular-nums text-[var(--color-text-primary)]">
                                    {valueFormatter(s.points[hover.idx])}
                                </span>
                            </div>
                        ))}
                    </div>
                </ChartTooltip>
            )}

            {showLegend && (
                <ChartLegend
                    items={series.map((s) => ({ label: s.name, color: s.color }))}
                    className="mt-3"
                />
            )}
        </div>
    );
}
