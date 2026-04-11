import { useMemo } from "react";
import { Card, CardContent, Badge } from "@/atoms";
import { DataTable } from "@/components/shared";
import { formatUsdAsSar, formatPercentage } from "@/utils";
import type { CostData, CostRiskItem } from "@/data/seed";

interface RisksTabProps {
    data: CostData;
}

const STATUS_VARIANTS: Record<CostRiskItem["status"], "default" | "secondary" | "destructive" | "outline"> = {
    "قائم": "destructive",
    "مخفف": "secondary",
    "مغلق": "default",
};

// 5x5 risk matrix heatmap. probability/impact bucket = 1..5
function bucket(v: number): number {
    return Math.min(5, Math.max(1, Math.ceil(v * 5)));
}

function cellTone(prob: number, impact: number): string {
    const score = prob * impact;
    if (score <= 6) return "bg-[var(--color-success)]/25 text-[var(--color-success)]";
    if (score <= 12) return "bg-[var(--color-warning)]/30 text-[var(--color-warning)]";
    if (score <= 16) return "bg-orange-500/30 text-orange-500";
    return "bg-[var(--color-error)]/35 text-[var(--color-error)]";
}

export function RisksTab({ data }: RisksTabProps) {
    // Build 5x5 matrix counts
    const matrix = useMemo(() => {
        const m: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
        for (const r of data.risks) {
            const p = bucket(r.probability) - 1;
            const i = bucket(r.impact) - 1;
            m[i][p] += 1;
        }
        return m;
    }, [data.risks]);

    const columns = [
        { key: "risk", header: "الخطر", render: (r: CostRiskItem) => <span className="font-medium">{r.risk}</span> },
        {
            key: "probability",
            header: "الاحتمالية",
            render: (r: CostRiskItem) => <span className="tabular-nums">{formatPercentage(r.probability)}</span>,
            className: "text-end",
        },
        {
            key: "impact",
            header: "الأثر",
            render: (r: CostRiskItem) => <span className="tabular-nums">{formatPercentage(r.impact)}</span>,
            className: "text-end",
        },
        {
            key: "exposure",
            header: "التعرض المالي",
            render: (r: CostRiskItem) => <span className="tabular-nums font-semibold">{formatUsdAsSar(r.exposure, { compact: true })}</span>,
            className: "text-end",
        },
        {
            key: "remainingExposure",
            header: "المتبقي",
            render: (r: CostRiskItem) => <span className="tabular-nums">{formatUsdAsSar(r.remainingExposure, { compact: true })}</span>,
            className: "text-end",
        },
        { key: "response", header: "الاستجابة", render: (r: CostRiskItem) => <span className="text-xs">{r.response}</span> },
        { key: "owner", header: "المالك", render: (r: CostRiskItem) => <span className="text-xs">{r.owner}</span> },
        {
            key: "status",
            header: "الحالة",
            render: (r: CostRiskItem) => <Badge variant={STATUS_VARIANTS[r.status]}>{r.status}</Badge>,
        },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                        مصفوفة المخاطر (الاحتمالية × الأثر)
                    </h3>
                    <div className="flex items-end gap-3">
                        <div className="flex flex-col items-center gap-1">
                            <span className="rotate-180 text-[10px] text-[var(--color-text-muted)]" style={{ writingMode: "vertical-rl" }}>
                                الأثر
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="grid grid-cols-5 gap-1">
                                {matrix.slice().reverse().map((row, ri) =>
                                    row.map((count, ci) => {
                                        const impactBucket = 5 - ri;
                                        const probBucket = ci + 1;
                                        return (
                                            <div
                                                key={`${ri}-${ci}`}
                                                className={`flex aspect-square items-center justify-center rounded-md text-sm font-bold tabular-nums ${cellTone(probBucket, impactBucket)}`}
                                                title={`احتمالية ${probBucket}، أثر ${impactBucket}`}
                                            >
                                                {count > 0 ? count : ""}
                                            </div>
                                        );
                                    }),
                                )}
                            </div>
                            <div className="mt-2 text-center text-[10px] text-[var(--color-text-muted)]">الاحتمالية</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <DataTable columns={columns} data={data.risks} emptyMessage="لا توجد مخاطر" />
                </CardContent>
            </Card>
        </div>
    );
}
