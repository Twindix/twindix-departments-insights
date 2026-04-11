import { Card, CardContent } from "@/atoms";
import { formatPercentage, formatNumber } from "@/utils";
import type { QualityData, QualityInputItem } from "@/data/seed";

interface InputsTabProps {
    data: QualityData;
}

function formatValue(item: QualityInputItem): string {
    if (typeof item.value === "string") return item.value;
    if (item.label.includes("نسبة") || item.label.includes("متوسط الإنجاز")) {
        return formatPercentage(item.value);
    }
    return formatNumber(item.value);
}

export function QualityInputsTab({ data }: InputsTabProps) {
    const groups = new Map<string, QualityInputItem[]>();
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
                                <div key={idx} className="flex items-start justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-[var(--color-text-secondary)]">{item.label}</p>
                                        {item.note && (
                                            <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">{item.note}</p>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold tabular-nums text-[var(--color-text-primary)] text-end shrink-0">
                                        {formatValue(item)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
