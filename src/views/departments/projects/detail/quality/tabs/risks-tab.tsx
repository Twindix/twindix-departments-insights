import { useMemo } from "react";
import { Card, CardContent, Badge } from "@/atoms";
import { DataTable } from "@/components/shared";
import type { QualityData, QualityRiskItem } from "@/data/seed";

interface RisksTabProps {
    data: QualityData;
}

const STATUS_VARIANTS: Record<QualityRiskItem["status"], "default" | "secondary" | "outline" | "destructive"> = {
    "منخفض": "outline",
    "قيد المتابعة": "secondary",
    "قيد المعالجة": "default",
    "مرتفع": "destructive",
};

function cellTone(prob: number, impact: number): string {
    const score = prob * impact;
    if (score <= 6) return "bg-[var(--color-success)]/25 text-[var(--color-success)]";
    if (score <= 12) return "bg-[var(--color-warning)]/30 text-[var(--color-warning)]";
    if (score <= 16) return "bg-orange-500/30 text-orange-500";
    return "bg-[var(--color-error)]/35 text-[var(--color-error)]";
}

export function QualityRisksTab({ data }: RisksTabProps) {
    const matrix = useMemo(() => {
        const m: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
        for (const r of data.risks) {
            const p = Math.min(5, Math.max(1, r.probability)) - 1;
            const i = Math.min(5, Math.max(1, r.impact)) - 1;
            m[i][p] += 1;
        }
        return m;
    }, [data.risks]);

    const columns = [
        { key: "id", header: "رقم", render: (r: QualityRiskItem) => <span className="text-xs tabular-nums">{r.id}</span>, className: "w-20" },
        { key: "description", header: "وصف الخطر", render: (r: QualityRiskItem) => <span className="text-sm">{r.description}</span> },
        { key: "category", header: "التصنيف", render: (r: QualityRiskItem) => <Badge variant="outline">{r.category}</Badge> },
        { key: "probability", header: "الاحتمال", render: (r: QualityRiskItem) => <span className="tabular-nums">{r.probability}</span>, className: "text-end" },
        { key: "impact", header: "الأثر", render: (r: QualityRiskItem) => <span className="tabular-nums">{r.impact}</span>, className: "text-end" },
        { key: "riskScore", header: "درجة الخطر", render: (r: QualityRiskItem) => <span className="font-semibold tabular-nums">{r.riskScore}</span>, className: "text-end" },
        { key: "response", header: "إجراء المعالجة", render: (r: QualityRiskItem) => <span className="text-xs">{r.response}</span> },
        { key: "status", header: "الحالة", render: (r: QualityRiskItem) => <Badge variant={STATUS_VARIANTS[r.status]}>{r.status}</Badge> },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                        مصفوفة المخاطر (الاحتمالية × الأثر)
                    </h3>
                    <div className="grid grid-cols-5 gap-1 max-w-md">
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
                    <div className="mt-2 max-w-md text-center text-[10px] text-[var(--color-text-muted)]">الاحتمالية ←</div>
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
