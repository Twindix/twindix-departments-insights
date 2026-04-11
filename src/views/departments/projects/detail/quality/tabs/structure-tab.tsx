import { Card, CardContent } from "@/atoms";
import { BarChart, DataTable, ProgressBar } from "@/components/shared";
import { formatPercentage } from "@/utils";
import type { QualityData, QualityStructureItem } from "@/data/seed";

interface StructureTabProps {
    data: QualityData;
}

export function QualityStructureTab({ data }: StructureTabProps) {
    const columns = [
        {
            key: "rank",
            header: "#",
            render: (q: QualityStructureItem) => <span className="tabular-nums">{q.rank}</span>,
            className: "w-8",
        },
        {
            key: "name",
            header: "البند الرئيسي",
            render: (q: QualityStructureItem) => <span className="font-medium">{q.name}</span>,
        },
        {
            key: "weight",
            header: "الوزن النسبي",
            render: (q: QualityStructureItem) => <span className="tabular-nums">{formatPercentage(q.weight)}</span>,
            className: "text-end",
        },
        {
            key: "currentValue",
            header: "المؤشر الحالي",
            render: (q: QualityStructureItem) => <span className="tabular-nums">{formatPercentage(q.currentValue)}</span>,
            className: "text-end",
        },
        {
            key: "target",
            header: "المستهدف",
            render: (q: QualityStructureItem) => <span className="tabular-nums text-[var(--color-text-muted)]">{formatPercentage(q.target)}</span>,
            className: "text-end",
        },
        {
            key: "score",
            header: "درجة التقييم",
            render: (q: QualityStructureItem) => (
                <ProgressBar value={q.score * 100} size="sm" showPercentage label="" className="min-w-[110px]" />
            ),
        },
        {
            key: "achievedWeight",
            header: "الوزن المحقق",
            render: (q: QualityStructureItem) => (
                <span className="font-semibold tabular-nums">{formatPercentage(q.achievedWeight)}</span>
            ),
            className: "text-end",
        },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                        الوزن المحقق لكل بند جودة
                    </h3>
                    <BarChart
                        data={[...data.structure]
                            .sort((a, b) => b.achievedWeight - a.achievedWeight)
                            .map((q) => ({
                                label: q.name,
                                value: q.achievedWeight,
                                color: q.score >= 0.95 ? "var(--color-success)" : q.score >= 0.85 ? "var(--color-primary)" : "var(--color-warning)",
                                sublabel: `وزن ${formatPercentage(q.weight)}`,
                            }))}
                        valueFormatter={(v) => formatPercentage(v)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <DataTable columns={columns} data={data.structure} emptyMessage="لا توجد بنود جودة" />
                </CardContent>
            </Card>
        </div>
    );
}
