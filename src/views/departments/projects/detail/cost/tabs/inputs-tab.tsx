import { Card, CardContent, Badge } from "@/atoms";
import { formatUsdAsSar, formatPercentage, formatNumber } from "@/utils";
import type { CostData, CostInputItem } from "@/data/seed";

interface InputsTabProps {
    data: CostData;
}

function formatValue(item: CostInputItem): string {
    if (item.unit === "نسبة") return formatPercentage(item.value);
    if (item.unit === "دولار") return formatUsdAsSar(item.value, { compact: true });
    return `${formatNumber(item.value)} ${item.unit}`;
}

export function InputsTab({ data }: InputsTabProps) {
    // Group by category
    const groups = new Map<string, CostInputItem[]>();
    for (const item of data.inputs) {
        const list = groups.get(item.category) ?? [];
        list.push(item);
        groups.set(item.category, list);
    }

    return (
        <div className="space-y-4">
            {Array.from(groups.entries()).map(([category, items]) => (
                <Card key={category}>
                    <CardContent className="p-6">
                        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                            {category}
                        </h3>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            {item.label}
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                                            {item.note}
                                        </p>
                                    </div>
                                    <div className="text-end">
                                        <p className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">
                                            {formatValue(item)}
                                        </p>
                                        <Badge variant={item.inputType === "ناتج" ? "secondary" : "outline"} className="mt-1 text-[9px]">
                                            {item.inputType}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
