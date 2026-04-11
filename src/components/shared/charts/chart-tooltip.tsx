import type { ReactNode } from "react";
import { cn } from "@/utils";

interface ChartTooltipProps {
    x: number;
    y: number;
    visible: boolean;
    children: ReactNode;
    className?: string;
}

/**
 * Floating tooltip used by chart primitives.
 * Position is in pixels relative to the chart's positioned container.
 * Anchored above the cursor (translate -50% -100%).
 */
export function ChartTooltip({ x, y, visible, children, className }: ChartTooltipProps) {
    if (!visible) return null;
    return (
        <div
            className={cn(
                "pointer-events-none absolute z-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs shadow-lg whitespace-nowrap",
                className,
            )}
            style={{
                left: x,
                top: y,
                transform: "translate(-50%, calc(-100% - 8px))",
            }}
        >
            {children}
        </div>
    );
}
