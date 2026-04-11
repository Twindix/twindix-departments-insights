import { Card, CardContent, Badge } from "@/atoms";
import { DonutChart } from "@/components/shared";
import { formatUsdAsSar, formatPercentage } from "@/utils";
import type { CostData, SensitiveIndicator } from "@/data/seed";
import { KpiTile } from "../kpi-tile";

interface RevenueProfitabilityTabProps {
    data: CostData;
}

const STATUS_VARIANTS: Record<SensitiveIndicator["status"], "default" | "secondary" | "destructive" | "outline"> = {
    "جيد": "default",
    "مقبول": "secondary",
    "تحذير": "outline",
    "حرج": "destructive",
};

export function RevenueProfitabilityTab({ data }: RevenueProfitabilityTabProps) {
    const p = data.profitability;

    const breakdown = [
        { label: "مكتملة", value: p.completedUnits.revenue, color: "var(--color-success)", count: p.completedUnits.count, profit: p.completedUnits.profit },
        { label: "تحت التنفيذ", value: p.inProgressUnits.revenue, color: "var(--color-primary)", count: p.inProgressUnits.count, profit: p.inProgressUnits.profit },
        { label: "مرحلة مبكرة", value: p.earlyUnits.revenue, color: "var(--color-warning)", count: p.earlyUnits.count, profit: p.earlyUnits.profit },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <KpiTile
                    label="إجمالي الإيرادات التعاقدية"
                    value={formatUsdAsSar(p.contractedRevenue, { compact: true })}
                    tone="info"
                />
                <KpiTile
                    label="الميزانية الأصلية"
                    value={formatUsdAsSar(p.originalBudget, { compact: true })}
                />
                <KpiTile
                    label="الربح الإجمالي المخطط"
                    value={formatUsdAsSar(p.plannedGrossProfit, { compact: true })}
                />
                <KpiTile
                    label="الإيراد المعترف به حتى تاريخه"
                    value={formatUsdAsSar(p.recognizedRevenue, { compact: true })}
                />
                <KpiTile
                    label="التكلفة الفعلية حتى تاريخه"
                    value={formatUsdAsSar(p.actualCostToDate, { compact: true })}
                />
                <KpiTile
                    label="الربح المحقق حتى تاريخه"
                    value={formatUsdAsSar(p.realizedProfit, { compact: true })}
                    tone={p.realizedProfit > 0 ? "success" : "warning"}
                />
                <KpiTile
                    label="التكلفة المتوقعة عند الإنجاز"
                    value={formatUsdAsSar(p.eac, { compact: true })}
                />
                <KpiTile
                    label="الربح المتوقع النهائي"
                    value={formatUsdAsSar(p.expectedFinalProfit, { compact: true })}
                    tone="success"
                />
                <KpiTile
                    label="هامش الربح المتوقع"
                    value={formatPercentage(p.expectedMargin)}
                    tone={p.expectedMargin >= 0.20 ? "success" : "warning"}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                            توزيع الإيرادات حسب حالة الوحدات
                        </h3>
                        <DonutChart
                            data={breakdown.map((b) => ({
                                label: `${b.label} (${b.count})`,
                                value: b.value,
                                color: b.color,
                            }))}
                            centerValue={formatUsdAsSar(p.contractedRevenue, { compact: true })}
                            centerLabel="إجمالي الإيرادات"
                            size={220}
                            thickness={48}
                            valueFormatter={(v) => formatUsdAsSar(v, { compact: true })}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-3 p-6">
                        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                            متوسطات لكل وحدة
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                                <p className="text-[11px] text-[var(--color-text-muted)]">متوسط سعر البيع</p>
                                <p className="text-lg font-bold tabular-nums">{formatUsdAsSar(p.avgUnitPrice, { compact: true })}</p>
                            </div>
                            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                                <p className="text-[11px] text-[var(--color-text-muted)]">متوسط التكلفة النهائية</p>
                                <p className="text-lg font-bold tabular-nums">{formatUsdAsSar(p.avgFinalCostPerUnit, { compact: true })}</p>
                            </div>
                            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                                <p className="text-[11px] text-[var(--color-text-muted)]">متوسط الربح للوحدة</p>
                                <p className="text-lg font-bold tabular-nums text-[var(--color-success)]">{formatUsdAsSar(p.avgProfitPerUnit, { compact: true })}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-6">
                    <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                        مؤشرات الربحية الحساسة للإدارة العليا
                    </h3>
                    <div className="space-y-3">
                        {p.sensitiveIndicators.map((ind, idx) => (
                            <div
                                key={idx}
                                className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                            >
                                <div className="min-w-[180px] flex-1">
                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{ind.name}</p>
                                    <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">{ind.formula}</p>
                                </div>
                                <div className="text-end">
                                    <p className="text-base font-bold tabular-nums">
                                        {ind.unit === "نسبة" ? formatPercentage(ind.value) : ind.value.toLocaleString("ar-EG")}
                                    </p>
                                    <p className="text-[10px] text-[var(--color-text-muted)]">{ind.reading}</p>
                                </div>
                                <Badge variant={STATUS_VARIANTS[ind.status]}>{ind.status}</Badge>
                                <p className="basis-full text-xs text-[var(--color-text-secondary)] sm:basis-auto sm:flex-1 sm:text-end">
                                    {ind.recommendation}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
