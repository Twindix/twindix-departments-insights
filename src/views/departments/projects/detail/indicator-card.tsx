import { ChevronLeft, DollarSign, Clock, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/atoms";
import { ScoreGauge } from "@/components/shared";
import { cn } from "@/utils";

type IndicatorVariant = "cost" | "time" | "quality";

interface IndicatorCardProps {
    variant: IndicatorVariant;
    value: number;
    onClick: () => void;
    className?: string;
}

const VARIANT_META: Record<IndicatorVariant, { label: string; subtitle: string; Icon: typeof DollarSign }> = {
    cost: {
        label: "مؤشر التكلفة",
        subtitle: "الميزانية، التدفق النقدي، والربحية",
        Icon: DollarSign,
    },
    time: {
        label: "مؤشر الوقت",
        subtitle: "الجدول الزمني، التأخيرات، والمراحل",
        Icon: Clock,
    },
    quality: {
        label: "مؤشر الجودة",
        subtitle: "الفحوصات، العيوب، ومعايير التنفيذ",
        Icon: ShieldCheck,
    },
};

export function IndicatorCard({ variant, value, onClick, className }: IndicatorCardProps) {
    const meta = VARIANT_META[variant];
    const Icon = meta.Icon;

    return (
        <Card
            onClick={onClick}
            className={cn(
                "group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-[var(--color-primary)]/50 hover:shadow-lg",
                className,
            )}
        >
            <CardContent className="flex flex-col items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <Icon className="h-6 w-6" />
                </div>

                <ScoreGauge score={value} size="lg" showPercentage={true} />

                <div className="text-center">
                    <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                        {meta.label}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {meta.subtitle}
                    </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] opacity-70 group-hover:opacity-100 transition-opacity">
                    <span>عرض التفاصيل</span>
                    <ChevronLeft className="h-3.5 w-3.5" />
                </div>
            </CardContent>
        </Card>
    );
}
