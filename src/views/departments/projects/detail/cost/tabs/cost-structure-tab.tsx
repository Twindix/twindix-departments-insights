import { useMemo } from "react";
import { Card, CardContent } from "@/atoms";
import { BarChart, DataTable } from "@/components/shared";
import { formatUsdAsSar, formatPercentage } from "@/utils";
import type { CostData, CostStructureItem } from "@/data/seed";

interface CostStructureTabProps {
    data: CostData;
}

export function CostStructureTab({ data }: CostStructureTabProps) {
    // Group by level1 for stacked horizontal bar chart
    const byLevel1 = useMemo(() => {
        const map = new Map<string, { reestimated: number; actual: number }>();
        for (const item of data.structure) {
            const cur = map.get(item.level1) ?? { reestimated: 0, actual: 0 };
            cur.reestimated += item.reestimated;
            cur.actual += item.actualToDate;
            map.set(item.level1, cur);
        }
        return Array.from(map.entries());
    }, [data.structure]);

    const columns = [
        {
            key: "level1",
            header: "البند الرئيسي",
            render: (row: CostStructureItem) => (
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">{row.level1}</span>
            ),
        },
        {
            key: "level2",
            header: "البند الفرعي",
            render: (row: CostStructureItem) => (
                <span className="text-sm text-[var(--color-text-primary)]">{row.level2}</span>
            ),
        },
        {
            key: "originalBudget",
            header: "الميزانية الأصلية",
            render: (row: CostStructureItem) => (
                <span className="tabular-nums">{formatUsdAsSar(row.originalBudget, { compact: true })}</span>
            ),
            className: "text-end",
        },
        {
            key: "reestimated",
            header: "المعاد تقديره",
            render: (row: CostStructureItem) => (
                <span className="tabular-nums">{formatUsdAsSar(row.reestimated, { compact: true })}</span>
            ),
            className: "text-end",
        },
        {
            key: "actualToDate",
            header: "المنفذ حتى تاريخه",
            render: (row: CostStructureItem) => (
                <span className="tabular-nums">{formatUsdAsSar(row.actualToDate, { compact: true })}</span>
            ),
            className: "text-end",
        },
        {
            key: "variance",
            header: "الانحراف",
            render: (row: CostStructureItem) => (
                <span className={`tabular-nums ${row.variance > 0 ? "text-[var(--color-error)]" : "text-[var(--color-success)]"}`}>
                    {row.variance > 0 ? "+" : ""}
                    {formatUsdAsSar(row.variance, { compact: true })}
                </span>
            ),
            className: "text-end",
        },
        {
            key: "spendPct",
            header: "نسبة الصرف",
            render: (row: CostStructureItem) => (
                <span className="tabular-nums">{formatPercentage(row.spendPct)}</span>
            ),
            className: "text-end",
        },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                        توزيع التكاليف حسب البند الرئيسي (المعاد تقديره مقابل المنفذ)
                    </h3>
                    <BarChart
                        data={byLevel1.map(([name, vals]) => ({
                            label: name,
                            segments: [
                                { value: vals.actual, color: "var(--color-primary)", name: "المنفذ" },
                                { value: Math.max(0, vals.reestimated - vals.actual), color: "var(--color-surface-active)", name: "المتبقي" },
                            ],
                        }))}
                        valueFormatter={(v) => formatUsdAsSar(v, { compact: true })}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <DataTable columns={columns} data={data.structure} emptyMessage="لا توجد بنود تكلفة" />
                </CardContent>
            </Card>
        </div>
    );
}
