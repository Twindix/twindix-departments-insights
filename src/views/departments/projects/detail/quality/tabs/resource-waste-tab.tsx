import { Card, CardContent, Badge } from "@/atoms";
import { DataTable } from "@/components/shared";
import { formatUsdAsSar, formatPercentage, formatNumber } from "@/utils";
import type { QualityData, QualityResourceWasteItem } from "@/data/seed";

interface ResourceWasteTabProps {
    data: QualityData;
}

const CATEGORY_VARIANTS: Record<QualityResourceWasteItem["category"], "default" | "secondary" | "outline"> = {
    "مواد": "default",
    "وقت": "secondary",
    "معدات": "outline",
};

export function ResourceWasteTab({ data }: ResourceWasteTabProps) {
    const totalWasteCost = data.resourceWaste.reduce((s, w) => s + w.wasteCostUsd, 0);
    const materialsCost = data.resourceWaste.filter((w) => w.category === "مواد").reduce((s, w) => s + w.wasteCostUsd, 0);
    const timeCost = data.resourceWaste.filter((w) => w.category === "وقت").reduce((s, w) => s + w.wasteCostUsd, 0);
    const equipmentCost = data.resourceWaste.filter((w) => w.category === "معدات").reduce((s, w) => s + w.wasteCostUsd, 0);

    const columns = [
        { key: "category", header: "الفئة", render: (w: QualityResourceWasteItem) => <Badge variant={CATEGORY_VARIANTS[w.category]}>{w.category}</Badge> },
        { key: "resource", header: "المورد", render: (w: QualityResourceWasteItem) => <span className="font-medium">{w.resource}</span> },
        { key: "unit", header: "الوحدة", render: (w: QualityResourceWasteItem) => <span className="text-[var(--color-text-muted)]">{w.unit}</span> },
        { key: "actual", header: "الفعلي", render: (w: QualityResourceWasteItem) => <span className="tabular-nums">{formatNumber(w.actual)}</span>, className: "text-end" },
        { key: "productive", header: "المنتج", render: (w: QualityResourceWasteItem) => <span className="tabular-nums">{formatNumber(w.productive)}</span>, className: "text-end" },
        { key: "waste", header: "الهدر", render: (w: QualityResourceWasteItem) => <span className="tabular-nums">{formatNumber(w.waste)}</span>, className: "text-end" },
        {
            key: "wastePct",
            header: "نسبة الهدر",
            render: (w: QualityResourceWasteItem) => (
                <span className={`tabular-nums ${w.wastePct > w.targetPct ? "text-[var(--color-error)]" : "text-[var(--color-success)]"}`}>
                    {formatPercentage(w.wastePct)}
                </span>
            ),
            className: "text-end",
        },
        { key: "wasteCostUsd", header: "التكلفة", render: (w: QualityResourceWasteItem) => <span className="font-semibold tabular-nums">{formatUsdAsSar(w.wasteCostUsd, { compact: true })}</span>, className: "text-end" },
        { key: "notes", header: "ملاحظة الإدارة", render: (w: QualityResourceWasteItem) => <span className="text-xs text-[var(--color-text-muted)]">{w.notes}</span> },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <p className="text-xs text-[var(--color-text-muted)]">إجمالي تكلفة الهدر</p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-[var(--color-error)]">
                        {formatUsdAsSar(totalWasteCost, { compact: true })}
                    </p>
                </div>
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <p className="text-xs text-[var(--color-text-muted)]">المواد</p>
                    <p className="mt-1 text-xl font-bold tabular-nums">
                        {formatUsdAsSar(materialsCost, { compact: true })}
                    </p>
                </div>
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <p className="text-xs text-[var(--color-text-muted)]">الوقت</p>
                    <p className="mt-1 text-xl font-bold tabular-nums">
                        {formatUsdAsSar(timeCost, { compact: true })}
                    </p>
                </div>
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <p className="text-xs text-[var(--color-text-muted)]">المعدات</p>
                    <p className="mt-1 text-xl font-bold tabular-nums">
                        {formatUsdAsSar(equipmentCost, { compact: true })}
                    </p>
                </div>
            </div>
            <Card>
                <CardContent className="p-6">
                    <DataTable columns={columns} data={data.resourceWaste} emptyMessage="لا توجد بيانات هدر" />
                </CardContent>
            </Card>
        </div>
    );
}
