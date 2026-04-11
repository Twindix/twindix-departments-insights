import { Card, CardContent, Badge } from "@/atoms";
import { BarChart, DataTable } from "@/components/shared";
import { formatUsdAsSar, formatPercentage, formatNumber } from "@/utils";
import type { QualityData, QualityMaterialItem } from "@/data/seed";

interface MaterialsTabProps {
    data: QualityData;
}

export function MaterialsTab({ data }: MaterialsTabProps) {
    const columns = [
        { key: "name", header: "المادة", render: (m: QualityMaterialItem) => <span className="font-medium">{m.name}</span> },
        { key: "unit", header: "الوحدة", render: (m: QualityMaterialItem) => <span className="text-[var(--color-text-muted)]">{m.unit}</span> },
        { key: "plannedQty", header: "المخططة", render: (m: QualityMaterialItem) => <span className="tabular-nums">{formatNumber(m.plannedQty)}</span>, className: "text-end" },
        { key: "actualUsedQty", header: "المستخدمة", render: (m: QualityMaterialItem) => <span className="tabular-nums">{formatNumber(m.actualUsedQty)}</span>, className: "text-end" },
        { key: "wasteQty", header: "المهدرة", render: (m: QualityMaterialItem) => <span className="tabular-nums">{formatNumber(m.wasteQty)}</span>, className: "text-end" },
        {
            key: "wastePct",
            header: "نسبة الهدر",
            render: (m: QualityMaterialItem) => (
                <span className={`tabular-nums ${m.wastePct > m.targetWastePct ? "text-[var(--color-error)]" : "text-[var(--color-success)]"}`}>
                    {formatPercentage(m.wastePct)}
                </span>
            ),
            className: "text-end",
        },
        { key: "targetWastePct", header: "المستهدف", render: (m: QualityMaterialItem) => <span className="tabular-nums text-[var(--color-text-muted)]">{formatPercentage(m.targetWastePct)}</span>, className: "text-end" },
        { key: "status", header: "الحالة", render: (m: QualityMaterialItem) => <Badge variant={m.status === "ضمن الهدف" ? "default" : "destructive"}>{m.status}</Badge> },
        { key: "wasteCostUsd", header: "تكلفة الهدر", render: (m: QualityMaterialItem) => <span className="font-semibold tabular-nums">{formatUsdAsSar(m.wasteCostUsd, { compact: true })}</span>, className: "text-end" },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                        تكلفة الهدر للمواد
                    </h3>
                    <BarChart
                        data={[...data.materials]
                            .sort((a, b) => b.wasteCostUsd - a.wasteCostUsd)
                            .map((m) => ({
                                label: m.name,
                                value: m.wasteCostUsd,
                                color: m.status === "بحاجة إلى تحسين" ? "var(--color-error)" : "var(--color-warning)",
                                sublabel: `${formatPercentage(m.wastePct)} هدر`,
                            }))}
                        valueFormatter={(v) => formatUsdAsSar(v, { compact: true })}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <DataTable columns={columns} data={data.materials} emptyMessage="لا توجد بيانات مواد" />
                </CardContent>
            </Card>
        </div>
    );
}
