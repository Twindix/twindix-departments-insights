interface SparklineProps {
    points: number[];
    color?: string;
    width?: number;
    height?: number;
    fillOpacity?: number;
    className?: string;
}

/**
 * Tiny inline trend line for KPI cards. Pure SVG, zero state.
 */
export function Sparkline({
    points,
    color = "var(--color-primary)",
    width = 80,
    height = 24,
    fillOpacity = 0.2,
    className,
}: SparklineProps) {
    if (points.length < 2) return null;

    let min = points[0];
    let max = points[0];
    for (const p of points) {
        if (p < min) min = p;
        if (p > max) max = p;
    }
    const range = max - min || 1;

    const stepX = width / (points.length - 1);
    const path = points
        .map((y, i) => {
            const x = i * stepX;
            const yScaled = height - 2 - ((y - min) / range) * (height - 4);
            return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${yScaled.toFixed(2)}`;
        })
        .join(" ");

    const fillPath = `${path} L ${width.toFixed(2)} ${height} L 0 ${height} Z`;

    return (
        <svg width={width} height={height} className={className} aria-hidden="true">
            <path d={fillPath} fill={color} fillOpacity={fillOpacity} />
            <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
