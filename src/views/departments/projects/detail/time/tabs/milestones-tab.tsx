import { Card, CardContent } from "@/atoms";
import { BarChart, LineChart } from "@/components/shared";
import { Flag } from "lucide-react";
import type { TimelineData } from "@/data/seed";

interface MilestonesTabProps {
    data: TimelineData;
}

export function MilestonesTab({ data }: MilestonesTabProps) {
    const xLabels = data.monthlyAggregation.map((m) => m.month);
    const cumSeries = [
        {
            name: "التراكم التسليمي",
            color: "var(--color-success)",
            points: data.monthlyAggregation.map((m) => m.cumulativeDelivered),
        },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                        وحدات بدأت ووحدات تم تسليمها لكل شهر
                    </h3>
                    <BarChart
                        data={data.monthlyAggregation.map((m) => ({
                            label: m.month,
                            segments: [
                                { value: m.unitsStarted, color: "var(--color-primary)", name: "بدأت" },
                                { value: m.unitsDelivered, color: "var(--color-success)", name: "تم تسليمها" },
                            ],
                        }))}
                        orientation="vertical"
                        valueFormatter={(v) => Math.round(v).toString()}
                        height={240}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                        التراكم التسليمي
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

            <Card>
                <CardContent className="p-6">
                    <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                        المعالم الرئيسية
                    </h3>
                    <div className="space-y-3">
                        {data.milestones.map((m, i) => (
                            <div key={i} className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/15">
                                    <Flag className="h-5 w-5 text-[var(--color-primary)]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-[var(--color-text-primary)]">{m.name}</p>
                                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">{m.note}</p>
                                </div>
                                <p className="text-sm font-medium tabular-nums text-[var(--color-text-secondary)]">
                                    {m.period}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
