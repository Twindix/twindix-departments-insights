import { ShieldCheck, CheckCircle2, XCircle, Wrench, Target, Layers, AlertTriangle, FileCheck } from "lucide-react";
import { Card, CardContent } from "@/atoms";
import { DonutChart } from "@/components/shared";
import { formatUsdAsSar, formatPercentage, formatNumber } from "@/utils";
import type { QualityData } from "@/data/seed";
import { KpiTile } from "../../cost/kpi-tile";

interface QualityDashboardTabProps {
    data: QualityData;
}

export function QualityDashboardTab({ data }: QualityDashboardTabProps) {
    const d = data.dashboard;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <KpiTile
                    label="إجمالي الوحدات"
                    value={formatNumber(d.totalUnits)}
                    icon={<Layers className="h-4 w-4" />}
                />
                <KpiTile
                    label="متوسط الإنجاز الكلي"
                    value={formatPercentage(d.overallProgress)}
                    icon={<Target className="h-4 w-4" />}
                />
                <KpiTile
                    label="مؤشر الجودة العام"
                    value={formatPercentage(d.qualityIndex)}
                    sublabel="ناتج الأوزان المحققة"
                    icon={<ShieldCheck className="h-4 w-4" />}
                />
                <KpiTile
                    label="القبول من أول مرة"
                    value={formatPercentage(d.firstTimeAcceptance)}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                />
                <KpiTile
                    label="نسبة إغلاق العيوب"
                    value={formatPercentage(d.defectClosureRate)}
                    icon={<FileCheck className="h-4 w-4" />}
                />
                <KpiTile
                    label="العيوب المفتوحة"
                    value={formatNumber(d.openDefects)}
                    sublabel={`مغلق: ${formatNumber(d.closedDefects)}`}
                    icon={<XCircle className="h-4 w-4" />}
                />
                <KpiTile
                    label="تكلفة إعادة العمل"
                    value={formatUsdAsSar(d.totalReworkCostUsd, { compact: true })}
                    icon={<Wrench className="h-4 w-4" />}
                />
                <KpiTile
                    label="متوسط الفحوصات / وحدة"
                    value={d.avgInspectionsPerUnit.toFixed(1)}
                    icon={<AlertTriangle className="h-4 w-4" />}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                            توزيع الوحدات حسب المرحلة
                        </h3>
                        <DonutChart
                            data={d.phaseDistribution.filter((p) => p.count > 0).map((p, i) => ({
                                label: p.phase,
                                value: p.count,
                                color: ["#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#fb923c", "#f472b6", "#10b981"][i % 7],
                            }))}
                            centerValue={String(d.totalUnits)}
                            centerLabel="إجمالي"
                            size={220}
                            thickness={48}
                            valueFormatter={(v) => `${v} وحدة`}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-3 p-6">
                        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                            أبرز ملاحظات الإدارة
                        </h3>
                        <ul className="space-y-2">
                            {d.topPriorities.map((p, i) => (
                                <li key={i} className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-xs font-bold text-[var(--color-primary)]">
                                        {i + 1}
                                    </span>
                                    <span className="text-[var(--color-text-secondary)]">{p}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
