import { DollarSign, TrendingUp, Wallet, AlertTriangle, CheckCircle2, Users, Activity, Layers } from "lucide-react";
import { Card, CardContent } from "@/atoms";
import { DonutChart, Sparkline } from "@/components/shared";
import { formatUsdAsSar, formatPercentage } from "@/utils";
import type { CostData } from "@/data/seed";
import { KpiTile } from "../kpi-tile";

interface DashboardTabProps {
    data: CostData;
}

export function DashboardTab({ data }: DashboardTabProps) {
    const d = data.dashboard;

    const statusColors: Record<string, string> = {
        "مكتملة": "var(--color-success)",
        "تحت التنفيذ": "var(--color-primary)",
        "مرحلة مبكرة": "var(--color-warning)",
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <KpiTile
                    label="إجمالي الإيرادات التعاقدية"
                    value={formatUsdAsSar(d.contractedRevenue, { compact: true })}
                    icon={<DollarSign className="h-4 w-4" />}
                />
                <KpiTile
                    label="الميزانية الأصلية"
                    value={formatUsdAsSar(d.originalBudget, { compact: true })}
                    icon={<Wallet className="h-4 w-4" />}
                />
                <KpiTile
                    label="التكلفة المتوقعة عند الإنجاز"
                    value={formatUsdAsSar(d.eac, { compact: true })}
                    sublabel={`انحراف ${formatUsdAsSar(d.eac - d.originalBudget, { compact: true })}`}
                    icon={<AlertTriangle className="h-4 w-4" />}
                />
                <KpiTile
                    label="الربح المتوقع النهائي"
                    value={formatUsdAsSar(d.expectedFinalProfit, { compact: true })}
                    sublabel={`هامش ${formatPercentage(d.expectedMargin)}`}
                    icon={<TrendingUp className="h-4 w-4" />}
                />
                <KpiTile
                    label="الصرف الفعلي حتى تاريخه"
                    value={formatUsdAsSar(d.actualSpendToDate, { compact: true })}
                    icon={<Activity className="h-4 w-4" />}
                />
                <KpiTile
                    label="الإيراد المعترف به"
                    value={formatUsdAsSar(d.revenueRecognizedToDate, { compact: true })}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                />
                <KpiTile
                    label="نسبة الإنجاز الحالية"
                    value={formatPercentage(d.completionPct)}
                    icon={<Layers className="h-4 w-4" />}
                />
                <KpiTile
                    label="نسبة الهدر الفعلية"
                    value={formatPercentage(d.actualWastePct)}
                    sublabel={`تكلفة إعادة العمل ${formatUsdAsSar(d.reworkCost, { compact: true })}`}
                    icon={<AlertTriangle className="h-4 w-4" />}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                                توزيع الوحدات حسب الحالة
                            </h3>
                            <Users className="h-4 w-4 text-[var(--color-text-muted)]" />
                        </div>
                        <DonutChart
                            data={d.statusBreakdown.map((s) => ({
                                label: s.status,
                                value: s.count,
                                color: statusColors[s.status] ?? "var(--color-primary)",
                            }))}
                            centerValue={String(d.completedUnits + d.inProgressUnits + d.earlyUnits)}
                            centerLabel="إجمالي الوحدات"
                            size={200}
                            thickness={42}
                            valueFormatter={(v) => `${v.toLocaleString("ar-EG")} وحدة`}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-4 p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                                التدفق النقدي التراكمي
                            </h3>
                            <Sparkline points={d.cashFlowSparkline} width={120} height={36} />
                        </div>
                        <div className="space-y-3">
                            {d.statusBreakdown.map((s) => (
                                <div key={s.status} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="h-2 w-2 rounded-sm"
                                                style={{ backgroundColor: statusColors[s.status] }}
                                            />
                                            <span className="text-[var(--color-text-secondary)]">{s.status}</span>
                                            <span className="text-[var(--color-text-muted)] tabular-nums">({s.count})</span>
                                        </div>
                                        <span className="font-semibold tabular-nums">
                                            {formatUsdAsSar(s.expectedRevenue, { compact: true })}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-[var(--color-text-muted)] tabular-nums">
                                        تكلفة متوقعة {formatUsdAsSar(s.expectedCost, { compact: true })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
