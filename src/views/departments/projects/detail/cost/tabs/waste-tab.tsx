import { Card, CardContent } from "@/atoms";
import { BarChart, DataTable } from "@/components/shared";
import { formatUsdAsSar, formatPercentage, formatNumber } from "@/utils";
import type { CostData, WasteItem } from "@/data/seed";

interface WasteTabProps {
    data: CostData;
}

export function WasteTab({ data }: WasteTabProps) {
    const totalWasteCost = data.waste.reduce((s, w) => s + w.wasteCost, 0);

    const columns = [
        {
            key: "resource",
            header: "المورد",
            render: (w: WasteItem) => <span className="font-medium">{w.resource}</span>,
        },
        {
            key: "unit",
            header: "الوحدة",
            render: (w: WasteItem) => <span className="text-[var(--color-text-muted)]">{w.unit}</span>,
        },
        {
            key: "plannedQty",
            header: "الكمية المخططة",
            render: (w: WasteItem) => <span className="tabular-nums">{formatNumber(w.plannedQty)}</span>,
            className: "text-end",
        },
        {
            key: "wasteQty",
            header: "الكمية المهدرة",
            render: (w: WasteItem) => <span className="tabular-nums">{formatNumber(w.wasteQty)}</span>,
            className: "text-end",
        },
        {
            key: "wastePct",
            header: "نسبة الهدر",
            render: (w: WasteItem) => (
                <span className={`tabular-nums ${w.wastePct > w.targetWastePct ? "text-[var(--color-error)]" : "text-[var(--color-success)]"}`}>
                    {formatPercentage(w.wastePct)}
                </span>
            ),
            className: "text-end",
        },
        {
            key: "targetWastePct",
            header: "المستهدف",
            render: (w: WasteItem) => (
                <span className="tabular-nums text-[var(--color-text-muted)]">{formatPercentage(w.targetWastePct)}</span>
            ),
            className: "text-end",
        },
        {
            key: "wasteCost",
            header: "تكلفة الهدر",
            render: (w: WasteItem) => (
                <span className="font-semibold tabular-nums">{formatUsdAsSar(w.wasteCost, { compact: true })}</span>
            ),
            className: "text-end",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardContent className="p-6">
                        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                            تكلفة الهدر حسب المورد
                        </h3>
                        <BarChart
                            data={[...data.waste]
                                .sort((a, b) => b.wasteCost - a.wasteCost)
                                .map((w) => ({
                                    label: w.resource,
                                    value: w.wasteCost,
                                    color: w.wastePct > w.targetWastePct ? "var(--color-error)" : "var(--color-warning)",
                                    sublabel: `${formatPercentage(w.wastePct)} هدر`,
                                }))}
                            valueFormatter={(v) => formatUsdAsSar(v, { compact: true })}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="space-y-3 p-6">
                        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">ملخص الهدر</h3>
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                            <p className="text-[11px] text-[var(--color-text-muted)]">إجمالي تكلفة الهدر</p>
                            <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--color-error)]">
                                {formatUsdAsSar(totalWasteCost, { compact: true })}
                            </p>
                        </div>
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                            <p className="text-[11px] text-[var(--color-text-muted)]">عدد البنود</p>
                            <p className="mt-1 text-2xl font-bold tabular-nums">{data.waste.length}</p>
                        </div>
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                            <p className="text-[11px] text-[var(--color-text-muted)]">بنود تتجاوز المستهدف</p>
                            <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--color-warning)]">
                                {data.waste.filter((w) => w.wastePct > w.targetWastePct).length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-6">
                    <DataTable columns={columns} data={data.waste} emptyMessage="لا توجد بنود هدر" />
                </CardContent>
            </Card>
        </div>
    );
}
