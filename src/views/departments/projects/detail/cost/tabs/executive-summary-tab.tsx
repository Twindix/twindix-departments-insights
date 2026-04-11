import { Card, CardContent, Badge } from "@/atoms";
import { formatUsdAsSar, formatPercentage } from "@/utils";
import type { CostData, ExecSummaryItem } from "@/data/seed";

interface ExecutiveSummaryTabProps {
    data: CostData;
}

const STATUS_VARIANTS: Record<ExecSummaryItem["status"], "default" | "secondary" | "destructive" | "outline"> = {
    "إيجابي": "default",
    "مطابق": "default",
    "مقبول": "secondary",
    "متوسط": "outline",
    "تحذير": "destructive",
};

function formatValue(item: ExecSummaryItem): string {
    if (item.unit === "نسبة") return formatPercentage(item.value);
    if (item.unit === "دولار") return formatUsdAsSar(item.value, { compact: true });
    return item.value.toLocaleString("ar-EG");
}

export function ExecutiveSummaryTab({ data }: ExecutiveSummaryTabProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="space-y-3">
                    {data.summary.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center"
                        >
                            <div className="min-w-[120px]">
                                <Badge variant="outline" className="mb-1">{item.axis}</Badge>
                                <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.indicator}</p>
                            </div>
                            <div className="flex flex-1 items-center justify-around gap-4 text-sm">
                                <div className="text-center">
                                    <p className="text-[10px] text-[var(--color-text-muted)]">القيمة الحالية</p>
                                    <p className="mt-0.5 font-bold tabular-nums">{formatValue(item)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-[var(--color-text-muted)]">المستهدف</p>
                                    <p className="mt-0.5 tabular-nums text-[var(--color-text-secondary)]">
                                        {item.unit === "نسبة"
                                            ? formatPercentage(item.target)
                                            : item.unit === "دولار"
                                                ? formatUsdAsSar(item.target, { compact: true })
                                                : item.target.toLocaleString("ar-EG")}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-[var(--color-text-muted)]">الفجوة</p>
                                    <p className={`mt-0.5 tabular-nums font-semibold ${
                                        item.gap > 0 ? "text-[var(--color-error)]" : item.gap < 0 ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"
                                    }`}>
                                        {item.unit === "نسبة"
                                            ? formatPercentage(item.gap)
                                            : item.unit === "دولار"
                                                ? formatUsdAsSar(item.gap, { compact: true })
                                                : item.gap.toLocaleString("ar-EG")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-start gap-2 sm:items-end">
                                <Badge variant={STATUS_VARIANTS[item.status]}>{item.status}</Badge>
                                <p className="text-xs text-[var(--color-text-secondary)] sm:text-end max-w-[260px]">
                                    {item.recommendation}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
