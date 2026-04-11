import { Card, CardContent } from "@/atoms";
import type { TimelineData } from "@/data/seed";

interface AssumptionsTabProps {
    data: TimelineData;
}

export function AssumptionsTab({ data }: AssumptionsTabProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                    افتراضات الجدولة الزمنية
                </h3>
                <div className="space-y-2">
                    {data.assumptions.map((a, idx) => (
                        <div key={idx} className="flex flex-col gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:flex-row sm:items-start sm:gap-3">
                            <p className="min-w-[200px] text-sm font-semibold text-[var(--color-text-primary)]">
                                {a.label}
                            </p>
                            <p className="flex-1 text-sm text-[var(--color-text-secondary)] tabular-nums">
                                {a.value}
                            </p>
                            {a.note && (
                                <p className="text-xs text-[var(--color-text-muted)] sm:max-w-[200px] sm:text-end">
                                    {a.note}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
