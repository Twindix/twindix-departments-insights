import { Card, CardContent, Badge } from "@/atoms";
import { LineChart, DataTable } from "@/components/shared";
import { convertUsdToSar, formatUsdAsSar, formatPercentage } from "@/utils";
import type { CostData, CashFlowMonth } from "@/data/seed";

interface CashFlowTabProps {
    data: CostData;
}

export function CashFlowTab({ data }: CashFlowTabProps) {
    const months = data.cashFlow;
    const xLabels = months.map((m) => m.month);

    const series = [
        {
            name: "الصرف الفعلي",
            color: "var(--color-error)",
            points: months.map((m) => convertUsdToSar(m.actualSpend)),
        },
        {
            name: "الإيراد المحصل",
            color: "var(--color-success)",
            points: months.map((m) => convertUsdToSar(m.revenueCollected)),
        },
    ];

    const cumSeries = [
        {
            name: "صافي التدفق التراكمي",
            color: "var(--color-primary)",
            points: months.map((m) => convertUsdToSar(m.netCumulative)),
        },
    ];

    const columns = [
        {
            key: "month",
            header: "الشهر",
            render: (m: CashFlowMonth) => (
                <span className="font-medium tabular-nums">{m.month}</span>
            ),
        },
        {
            key: "plannedSpend",
            header: "الصرف المخطط",
            render: (m: CashFlowMonth) => (
                <span className="tabular-nums">{formatUsdAsSar(m.plannedSpend, { compact: true })}</span>
            ),
            className: "text-end",
        },
        {
            key: "actualSpend",
            header: "الصرف الفعلي",
            render: (m: CashFlowMonth) => (
                <span className="tabular-nums">{formatUsdAsSar(m.actualSpend, { compact: true })}</span>
            ),
            className: "text-end",
        },
        {
            key: "revenueCollected",
            header: "الإيراد المحصل",
            render: (m: CashFlowMonth) => (
                <span className="tabular-nums">{formatUsdAsSar(m.revenueCollected, { compact: true })}</span>
            ),
            className: "text-end",
        },
        {
            key: "netMonthly",
            header: "صافي الشهر",
            render: (m: CashFlowMonth) => (
                <span className={`tabular-nums ${m.netMonthly < 0 ? "text-[var(--color-error)]" : "text-[var(--color-success)]"}`}>
                    {formatUsdAsSar(m.netMonthly, { compact: true })}
                </span>
            ),
            className: "text-end",
        },
        {
            key: "netCumulative",
            header: "التراكمي",
            render: (m: CashFlowMonth) => (
                <span className={`tabular-nums ${m.netCumulative < 0 ? "text-[var(--color-error)]" : "text-[var(--color-success)]"}`}>
                    {formatUsdAsSar(m.netCumulative, { compact: true })}
                </span>
            ),
            className: "text-end",
        },
        {
            key: "spendPctCum",
            header: "نسبة الصرف",
            render: (m: CashFlowMonth) => (
                <span className="tabular-nums">{formatPercentage(m.spendPctCum)}</span>
            ),
            className: "text-end",
        },
        {
            key: "status",
            header: "الحالة",
            render: (m: CashFlowMonth) => {
                const variant = m.status === "حالي" ? "default" : m.status === "منقضي" ? "secondary" : "outline";
                return <Badge variant={variant}>{m.status}</Badge>;
            },
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                            الصرف مقابل الإيرادات الشهرية
                        </h3>
                        <LineChart
                            series={series}
                            xLabels={xLabels}
                            fill={true}
                            valueFormatter={(v) => `${(v / 1_000_000).toFixed(1)} م`}
                            height={240}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                            صافي التدفق النقدي التراكمي
                        </h3>
                        <LineChart
                            series={cumSeries}
                            xLabels={xLabels}
                            fill={true}
                            valueFormatter={(v) => `${(v / 1_000_000).toFixed(1)} م`}
                            height={240}
                        />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-6">
                    <DataTable columns={columns} data={months} emptyMessage="لا توجد بيانات تدفق نقدي" />
                </CardContent>
            </Card>
        </div>
    );
}
