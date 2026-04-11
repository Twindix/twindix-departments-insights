import { Card, CardContent } from "@/atoms";
import { BarChart, DataTable, ProgressBar } from "@/components/shared";
import { formatUsdAsSar, formatPercentage, formatNumber } from "@/utils";
import type { QualityData, QualityContractorItem } from "@/data/seed";

interface ContractorsTabProps {
    data: QualityData;
}

export function QualityContractorsTab({ data }: ContractorsTabProps) {
    const columns = [
        {
            key: "name",
            header: "المقاول",
            render: (c: QualityContractorItem) => (
                <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{c.scope}</p>
                </div>
            ),
        },
        { key: "inspections", header: "عدد الفحوصات", render: (c: QualityContractorItem) => <span className="tabular-nums">{formatNumber(c.inspections)}</span>, className: "text-end" },
        { key: "acceptanceRate", header: "نسبة القبول", render: (c: QualityContractorItem) => <span className="tabular-nums">{formatPercentage(c.acceptanceRate)}</span>, className: "text-end" },
        { key: "openDefects", header: "عيوب مفتوحة", render: (c: QualityContractorItem) => <span className="tabular-nums">{c.openDefects}</span>, className: "text-end" },
        { key: "reworkCostUsd", header: "إعادة العمل", render: (c: QualityContractorItem) => <span className="tabular-nums">{formatUsdAsSar(c.reworkCostUsd, { compact: true })}</span>, className: "text-end" },
        { key: "wastePct", header: "نسبة الهدر", render: (c: QualityContractorItem) => <span className="tabular-nums">{formatPercentage(c.wastePct)}</span>, className: "text-end" },
        { key: "timeAdherence", header: "الالتزام الزمني", render: (c: QualityContractorItem) => <span className="tabular-nums">{formatPercentage(c.timeAdherence)}</span>, className: "text-end" },
        {
            key: "finalScore",
            header: "التقييم النهائي",
            render: (c: QualityContractorItem) => (
                <ProgressBar value={c.finalScore} size="sm" showPercentage label="" className="min-w-[120px]" />
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                        التقييم النهائي للمقاولين
                    </h3>
                    <BarChart
                        data={[...data.contractors]
                            .sort((a, b) => b.finalScore - a.finalScore)
                            .map((c) => ({
                                label: c.name,
                                value: c.finalScore,
                                color: c.finalScore >= 80 ? "var(--color-success)" : c.finalScore >= 70 ? "var(--color-primary)" : "var(--color-warning)",
                                sublabel: `قبول ${formatPercentage(c.acceptanceRate)}`,
                            }))}
                        valueFormatter={(v) => `${v}%`}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <DataTable columns={columns} data={data.contractors} emptyMessage="لا يوجد مقاولون" />
                </CardContent>
            </Card>
        </div>
    );
}
