import { cn } from "@/utils";

export interface LegendItem {
    label: string;
    color: string;
    value?: string;
}

interface ChartLegendProps {
    items: LegendItem[];
    className?: string;
    layout?: "horizontal" | "vertical";
}

export function ChartLegend({ items, className, layout = "horizontal" }: ChartLegendProps) {
    return (
        <div
            className={cn(
                layout === "horizontal"
                    ? "flex flex-wrap items-center gap-x-4 gap-y-2"
                    : "flex flex-col gap-2",
                className,
            )}
        >
            {items.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                    <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[var(--color-text-secondary)]">{item.label}</span>
                    {item.value && (
                        <span className="text-[var(--color-text-primary)] font-semibold tabular-nums">
                            {item.value}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}
