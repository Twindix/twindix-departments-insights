import { Card, CardContent } from "@/atoms";
import { DataTable, ProgressBar } from "@/components/shared";
import { formatUsdAsSar, formatPercentage } from "@/utils";
import type { CostData, CostContractorItem } from "@/data/seed";

interface ContractorsTabProps {
    data: CostData;
}

export function ContractorsTab({ data }: ContractorsTabProps) {
    const columns = [
        {
            key: "name",
            header: "المقاول",
            render: (c: CostContractorItem) => (
                <div>
                    <p className="font-medium text-[var(--color-text-primary)]">{c.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{c.scope}</p>
                </div>
            ),
        },
        {
            key: "contractValue",
            header: "قيمة العقد",
            render: (c: CostContractorItem) => (
                <span className="tabular-nums">{formatUsdAsSar(c.contractValue, { compact: true })}</span>
            ),
            className: "text-end",
        },
        {
            key: "spentToDate",
            header: "المصروف حتى تاريخه",
            render: (c: CostContractorItem) => (
                <span className="tabular-nums">{formatUsdAsSar(c.spentToDate, { compact: true })}</span>
            ),
            className: "text-end",
        },
        {
            key: "eac",
            header: "EAC",
            render: (c: CostContractorItem) => (
                <span className="tabular-nums">{formatUsdAsSar(c.eac, { compact: true })}</span>
            ),
            className: "text-end",
        },
        {
            key: "contractVariance",
            header: "الانحراف",
            render: (c: CostContractorItem) => (
                <span className={`tabular-nums ${c.contractVariance > 0 ? "text-[var(--color-error)]" : "text-[var(--color-success)]"}`}>
                    {formatUsdAsSar(c.contractVariance, { compact: true })}
                </span>
            ),
            className: "text-end",
        },
        {
            key: "wastePct",
            header: "نسبة الهدر",
            render: (c: CostContractorItem) => (
                <span className="tabular-nums">{formatPercentage(c.wastePct)}</span>
            ),
            className: "text-end",
        },
        {
            key: "reworkCost",
            header: "إعادة العمل",
            render: (c: CostContractorItem) => (
                <span className="tabular-nums">{formatUsdAsSar(c.reworkCost, { compact: true })}</span>
            ),
            className: "text-end",
        },
        {
            key: "qualityScore",
            header: "تقييم الجودة",
            render: (c: CostContractorItem) => (
                <ProgressBar value={c.qualityScore} size="sm" showPercentage label="" className="min-w-[100px]" />
            ),
            className: "text-end",
        },
    ];

    return (
        <Card>
            <CardContent className="p-6">
                <DataTable columns={columns} data={data.contractors} emptyMessage="لا يوجد مقاولون" />
            </CardContent>
        </Card>
    );
}
