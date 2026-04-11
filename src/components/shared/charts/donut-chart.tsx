import { useState } from "react";
import { cn } from "@/utils";
import { useMountAnimation } from "./use-mount-animation";
import { ChartLegend } from "./chart-legend";

export interface DonutChartItem {
    label: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    data: DonutChartItem[];
    centerLabel?: string;
    centerValue?: string;
    size?: number;
    thickness?: number;
    className?: string;
    showLegend?: boolean;
    legendLayout?: "horizontal" | "vertical";
    valueFormatter?: (v: number) => string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
    };
}

function describeDonutSlice(
    cx: number,
    cy: number,
    rOuter: number,
    rInner: number,
    startAngle: number,
    endAngle: number,
): string {
    const startOuter = polarToCartesian(cx, cy, rOuter, endAngle);
    const endOuter = polarToCartesian(cx, cy, rOuter, startAngle);
    const startInner = polarToCartesian(cx, cy, rInner, startAngle);
    const endInner = polarToCartesian(cx, cy, rInner, endAngle);
    const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        "M", startOuter.x.toFixed(2), startOuter.y.toFixed(2),
        "A", rOuter, rOuter, 0, largeArc, 0, endOuter.x.toFixed(2), endOuter.y.toFixed(2),
        "L", startInner.x.toFixed(2), startInner.y.toFixed(2),
        "A", rInner, rInner, 0, largeArc, 1, endInner.x.toFixed(2), endInner.y.toFixed(2),
        "Z",
    ].join(" ");
}

/**
 * SVG donut/pie chart with hover highlight and animated mount-in.
 * Pass `thickness === size / 2` for a full pie.
 */
export function DonutChart({
    data,
    centerLabel,
    centerValue,
    size = 200,
    thickness = 36,
    className,
    showLegend = true,
    legendLayout = "vertical",
    valueFormatter = (v) => v.toLocaleString("ar-EG"),
}: DonutChartProps) {
    const progress = useMountAnimation(900);
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);

    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const cx = size / 2;
    const cy = size / 2;
    const rOuter = size / 2 - 4;
    const rInner = Math.max(0, rOuter - thickness);

    let cumulative = 0;
    const slices = data.map((item) => {
        const startAngle = (cumulative / total) * 360;
        cumulative += item.value;
        const endAngle = (cumulative / total) * 360;
        const animatedEnd = startAngle + (endAngle - startAngle) * progress;
        return {
            item,
            startAngle,
            endAngle,
            animatedEnd,
            pct: item.value / total,
        };
    });

    return (
        <div className={cn("flex flex-col items-center gap-4", className)}>
            <svg width={size} height={size} className="overflow-visible">
                {slices.map((slice, idx) => {
                    const isHover = hoverIdx === idx;
                    const angleSpan = Math.max(slice.animatedEnd - slice.startAngle, 0.01);
                    return (
                        <path
                            key={idx}
                            d={describeDonutSlice(
                                cx,
                                cy,
                                isHover ? rOuter + 3 : rOuter,
                                rInner,
                                slice.startAngle,
                                slice.startAngle + angleSpan,
                            )}
                            fill={slice.item.color}
                            opacity={hoverIdx === null || isHover ? 1 : 0.5}
                            onMouseEnter={() => setHoverIdx(idx)}
                            onMouseLeave={() => setHoverIdx(null)}
                            className="cursor-pointer transition-all"
                        />
                    );
                })}
                {/* Center hole background — punches the donut visually so text never touches the ring */}
                {(centerLabel || centerValue) && rInner > 0 && (
                    <circle
                        cx={cx}
                        cy={cy}
                        r={rInner - 2}
                        fill="var(--color-bg)"
                    />
                )}
                {(centerLabel || centerValue) && (
                    <foreignObject
                        x={cx - rInner + 4}
                        y={cy - rInner + 4}
                        width={(rInner - 4) * 2}
                        height={(rInner - 4) * 2}
                    >
                        <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 px-1 text-center">
                            {centerValue && (
                                <span
                                    className="font-bold tabular-nums leading-tight text-[var(--color-text-primary)]"
                                    style={{
                                        // Auto-shrink based on inner diameter and text length
                                        fontSize: `${Math.max(10, Math.min(20, ((rInner - 4) * 2) / Math.max(centerValue.length * 0.55, 4)))}px`,
                                    }}
                                >
                                    {centerValue}
                                </span>
                            )}
                            {centerLabel && (
                                <span
                                    className="leading-tight text-[var(--color-text-muted)]"
                                    style={{
                                        fontSize: `${Math.max(8, Math.min(11, ((rInner - 4) * 2) / Math.max(centerLabel.length * 0.55, 8)))}px`,
                                    }}
                                >
                                    {centerLabel}
                                </span>
                            )}
                        </div>
                    </foreignObject>
                )}
            </svg>

            {showLegend && (
                <ChartLegend
                    items={data.map((d, i) => ({
                        label:
                            hoverIdx === i
                                ? `${d.label} (${((d.value / total) * 100).toFixed(1)}%)`
                                : d.label,
                        color: d.color,
                        value: valueFormatter(d.value),
                    }))}
                    layout={legendLayout}
                    className="w-full"
                />
            )}
        </div>
    );
}
