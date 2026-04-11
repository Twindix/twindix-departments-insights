import { CalendarDays, Clock4, TrendingUp, Layers, Flag, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/atoms";
import { LineChart } from "@/components/shared";
import { formatDate, formatPercentage } from "@/utils";
import type { TimelineData } from "@/data/seed";
import { KpiTile } from "../../cost/kpi-tile";

interface OverviewTabProps {
    data: TimelineData;
}

export function TimeOverviewTab({ data }: OverviewTabProps) {
    const s = data.summary;

    const xLabels = data.monthlyAggregation.map((m) => m.month);
    const series = [
        {
            name: "وحدات تم بدؤها",
            color: "var(--color-primary)",
            points: data.monthlyAggregation.map((m) => m.unitsStarted),
        },
        {
            name: "وحدات تم تسليمها",
            color: "var(--color-success)",
            points: data.monthlyAggregation.map((m) => m.unitsDelivered),
        },
    ];

    const cumSeries = [
        {
            name: "التراكم التسليمي",
            color: "var(--color-success)",
            points: data.monthlyAggregation.map((m) => m.cumulativeDelivered),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <KpiTile
                    label="إجمالي الوحدات"
                    value={s.totalUnits.toLocaleString("ar-EG")}
                    icon={<Layers className="h-4 w-4" />}
                    tone="info"
                />
                <KpiTile
                    label="مكتملة"
                    value={s.completedUnits.toLocaleString("ar-EG")}
                    sublabel={`${formatPercentage(s.completedUnits / s.totalUnits)}`}
                    icon={<Flag className="h-4 w-4" />}
                    tone="success"
                />
                <KpiTile
                    label="تحت التنفيذ"
                    value={s.inProgressUnits.toLocaleString("ar-EG")}
                    icon={<Clock4 className="h-4 w-4" />}
                />
                <KpiTile
                    label="مرحلة مبكرة"
                    value={s.earlyUnits.toLocaleString("ar-EG")}
                    icon={<AlertTriangle className="h-4 w-4" />}
                />
                <KpiTile
                    label="بداية المشروع"
                    value={formatDate(s.firstStartDate, "short")}
                    icon={<CalendarDays className="h-4 w-4" />}
                />
                <KpiTile
                    label="نهاية المشروع المتوقعة"
                    value={formatDate(s.lastEndDate, "short")}
                    icon={<CalendarDays className="h-4 w-4" />}
                />
                <KpiTile
                    label="متوسط المدة المخططة"
                    value={`${s.avgPlannedDurationDays.toLocaleString("ar-EG")} يوم`}
                    icon={<Clock4 className="h-4 w-4" />}
                />
                <KpiTile
                    label="متوسط التأخير الحالي"
                    value={`${s.avgCurrentDelayDays.toLocaleString("ar-EG")} يوم`}
                    icon={<TrendingUp className="h-4 w-4" />}
                    tone={s.avgCurrentDelayDays > 15 ? "warning" : s.avgCurrentDelayDays > 5 ? "neutral" : "success"}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                            وحدات بدأت ووحدات تم تسليمها شهرياً
                        </h3>
                        <LineChart
                            series={series}
                            xLabels={xLabels}
                            fill={true}
                            valueFormatter={(v) => Math.round(v).toString()}
                            height={240}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                            التراكم التسليمي عبر الزمن
                        </h3>
                        <LineChart
                            series={cumSeries}
                            xLabels={xLabels}
                            fill={true}
                            valueFormatter={(v) => Math.round(v).toString()}
                            height={240}
                        />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-6">
                    <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                        أهم المعالم
                    </h3>
                    <div className="space-y-3">
                        {data.milestones.map((m, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/15">
                                    <Flag className="h-4 w-4 text-[var(--color-primary)]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{m.name}</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">{m.note}</p>
                                </div>
                                <p className="text-xs font-medium tabular-nums text-[var(--color-text-secondary)]">{m.period}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
