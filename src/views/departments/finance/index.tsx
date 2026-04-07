import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, LockOpen, Droplets, TrendingUp, Landmark, Calculator } from "lucide-react";
import { Header, ScoreGauge } from "@/components/shared";
import { Button, Card, CardContent } from "@/atoms";
import { useDeferredLoad, usePageTitle } from "@/hooks";
import { routesData } from "@/data";
import { toast } from "sonner";

const FINANCE_INDICATORS = [
    { id: "liquidity", name: "إدارة السيولة", icon: Droplets, percentage: 85, color: "#3B82F6" },
    { id: "analysis", name: "التحليل المالي", icon: TrendingUp, percentage: 82, color: "#10B981" },
    { id: "capital", name: "الموازنات الرأسمالية", icon: Landmark, percentage: 78, color: "#F59E0B" },
    { id: "estimated", name: "الموازنات التقديرية", icon: Calculator, percentage: 79, color: "#8B5CF6" },
];
// Average: (85+82+78+79)/4 = 81

function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="h-8 w-48 rounded-lg bg-[var(--color-surface)] animate-pulse" />
            <div className="h-4 w-72 rounded-lg bg-[var(--color-surface)] animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-48 rounded-xl bg-[var(--color-surface)] animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    />
                ))}
            </div>
        </div>
    );
}

export function FinanceView() {
    const navigate = useNavigate();
    const isReady = useDeferredLoad(150);
    usePageTitle("إدارة المالية");

    const handleIndicatorClick = (indicator: (typeof FINANCE_INDICATORS)[number]) => {
        toast.error("ليس لديك تصريح للاطلاع على هذا المؤشر", {
            description: `الوصول إلى ${indicator.name} مقيّد. تواصل مع المسؤول للحصول على صلاحية.`,
            duration: 4000,
        });
    };

    if (!isReady) return <LoadingSkeleton />;

    return (
        <div className="space-y-6 animate-fade-in">
            <Header
                title="إدارة المالية"
                description="المؤشرات المالية للشركة"
                actions={
                    <Button
                        variant="outline"
                        onClick={() => navigate(routesData.dashboard)}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        العودة
                    </Button>
                }
            />

            {/* Lock/Unlock legend */}
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1.5">
                    <LockOpen className="h-3.5 w-3.5 text-emerald-500" /> متاح للعرض
                </span>
                <span className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> يتطلب صلاحية
                </span>
            </div>

            {/* Indicator cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FINANCE_INDICATORS.map((indicator) => {
                    return (
                        <Card
                            key={indicator.id}
                            className="relative p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-[var(--color-border-hover)]"
                            onClick={() => handleIndicatorClick(indicator)}
                        >
                            {/* Lock icon in corner */}
                            <div className="absolute top-3 left-3">
                                <Lock className="h-4 w-4 text-[var(--color-text-muted)]" />
                            </div>

                            <CardContent className="flex flex-col items-center gap-4 p-0">
                                <ScoreGauge score={indicator.percentage} size="md" />
                                <span className="text-sm font-bold text-[var(--color-text-dark)]">
                                    {indicator.name}
                                </span>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
