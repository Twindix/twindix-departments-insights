import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ClipboardCheck,
    GraduationCap,
    FileText,
    BarChart3,
    Gift,
    Wallet,
    Briefcase,
    ScrollText,
    SearchCheck,
    HeartHandshake,
    Lock,
    LockOpen,
} from "lucide-react";
import { useMemo } from "react";
import { Header } from "@/components/shared";
import { Button } from "@/atoms";
import { useDeferredLoad, usePageTitle } from "@/hooks";
import { routesData } from "@/data";
import { tableAllAvg } from "@/data/seed";
import { toast } from "sonner";

interface HrSection {
    id: string;
    name: string;
    icon: typeof ClipboardCheck;
    color: string;
    percentage: number;
    isAccessible: boolean;
    route?: string;
}

// Static percentages for the 9 non-performance sections (performance is computed)
const HR_SECTIONS: HrSection[] = [
    { id: "review", name: "المراجعة", icon: SearchCheck, color: "#3B82F6", percentage: 82, isAccessible: false },
    { id: "structure", name: "الهيكل والتوظيف", icon: Briefcase, color: "#8B5CF6", percentage: 76, isAccessible: false },
    { id: "training", name: "التدريب والتطوير", icon: GraduationCap, color: "#06B6D4", percentage: 69, isAccessible: false },
    { id: "policies", name: "السياسات والإجراءات", icon: FileText, color: "#A855F7", percentage: 71, isAccessible: false },
    { id: "performance", name: "تقييم وإدارة الأداء", icon: BarChart3, color: "#F97316", percentage: 74, isAccessible: true, route: routesData.departmentHrPerformance },
    { id: "benefits", name: "التحفيز والمزايا", icon: Gift, color: "#10B981", percentage: 65, isAccessible: false },
    { id: "payroll", name: "الرواتب والأجور", icon: Wallet, color: "#EAB308", percentage: 78, isAccessible: false },
    { id: "admin", name: "الشئون الإدارية", icon: ClipboardCheck, color: "#EC4899", percentage: 80, isAccessible: false },
    { id: "succession", name: "خطة التعاقب", icon: ScrollText, color: "#14B8A6", percentage: 67, isAccessible: false },
    { id: "loyalty", name: "الولاء المؤسسي", icon: HeartHandshake, color: "#EF4444", percentage: 72, isAccessible: false },
];

function PercentageRing({ percentage, color, size }: { percentage: number; color: string; size: number }) {
    const strokeWidth = 3;
    const r = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <svg width={size} height={size} className="absolute inset-0 -rotate-90" style={{ filter: `drop-shadow(0 0 4px ${color}33)` }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth} opacity={0.3} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out"
                style={{ animation: "ring-fill 1.5s ease-out forwards" }}
            />
        </svg>
    );
}

function SectionCircle({ section, index, total, onNavigate }: {
    section: HrSection;
    index: number;
    total: number;
    onNavigate: (section: HrSection) => void;
}) {
    const Icon = section.icon;
    const angle = (index / total) * 360 - 90;
    const radius = 38;
    const rad = (angle * Math.PI) / 180;
    const x = 50 + radius * Math.cos(rad);
    const y = 50 + radius * Math.sin(rad);
    const circleSize = 72;

    return (
        <div
            className="absolute flex flex-col items-center cursor-pointer group"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 2,
                animationDelay: `${index * 0.1}s`,
            }}
            onClick={() => onNavigate(section)}
        >
            {/* Main circle with percentage ring */}
            <div className="relative transition-transform duration-300 ease-out group-hover:scale-110" style={{ width: circleSize, height: circleSize }}>
                <PercentageRing percentage={section.percentage} color={section.isAccessible ? section.color : "var(--color-text-muted)"} size={circleSize} />

                {/* Inner circle */}
                <div
                    className="absolute inset-[5px] rounded-full flex items-center justify-center transition-all duration-300 group-hover:shadow-lg"
                    style={{
                        backgroundColor: "var(--color-bg)",
                        boxShadow: section.isAccessible ? `0 0 0 0 ${section.color}00` : "none",
                    }}
                >
                    {/* Glow on hover for accessible */}
                    {section.isAccessible && (
                        <div
                            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                            style={{ backgroundColor: section.color }}
                        />
                    )}
                    <Icon
                        className="h-6 w-6 transition-all duration-300 group-hover:scale-110"
                        style={{ color: section.isAccessible ? section.color : "var(--color-text-muted)" }}
                        strokeWidth={1.5}
                    />
                </div>

                {/* Percentage badge */}
                <div
                    className="absolute -top-1 -right-1 z-10 flex items-center justify-center h-6 w-6 rounded-full text-[9px] font-bold text-white shadow-md"
                    style={{ backgroundColor: section.isAccessible ? section.color : "var(--color-surface-active)" }}
                >
                    <span style={{ color: section.isAccessible ? "white" : "var(--color-text-muted)" }}>
                        %{section.percentage}
                    </span>
                </div>

                {/* Lock indicator */}
                <div className="absolute -bottom-0.5 -left-0.5 z-10">
                    {section.isAccessible ? (
                        <div className="h-5 w-5 rounded-full bg-emerald-500/90 flex items-center justify-center shadow-md backdrop-blur-sm">
                            <LockOpen className="h-2.5 w-2.5 text-white" />
                        </div>
                    ) : (
                        <div className="h-5 w-5 rounded-full bg-[var(--color-surface-active)]/80 flex items-center justify-center shadow-sm backdrop-blur-sm">
                            <Lock className="h-2.5 w-2.5 text-[var(--color-text-muted)]" />
                        </div>
                    )}
                </div>
            </div>

            {/* Label */}
            <span
                className="mt-1 text-[10px] font-semibold text-center leading-tight max-w-[4.5rem] transition-colors duration-300"
                style={{ color: section.isAccessible ? section.color : "var(--color-text-muted)" }}
            >
                {section.name}
            </span>
        </div>
    );
}

// "تقييم وإدارة الأداء" section = table's total all-employees avg (same as dashboard "متوسط الأداء")
const _perfSectionValue = tableAllAvg;

export function HrDepartmentView() {
    const navigate = useNavigate();
    const isReady = useDeferredLoad(150);
    usePageTitle("إدارة الموارد البشرية");

    const actualPerformance = _perfSectionValue;

    // Inject the actual performance into the performance section
    const sections = useMemo(() =>
        HR_SECTIONS.map((s) => s.id === "performance" ? { ...s, percentage: actualPerformance } : s),
    [actualPerformance]);

    const handleSectionClick = (section: HrSection) => {
        if (section.isAccessible && section.route) {
            navigate(section.route);
        } else {
            toast.error("ليس لديك تصريح للاطلاع على هذا القسم", {
                description: `الوصول إلى ${section.name} مقيّد. تواصل مع المسؤول للحصول على صلاحية.`,
                duration: 4000,
            });
        }
    };

    if (!isReady) {
        return (
            <div className="space-y-6 animate-fade-in">
                {/* Header skeleton */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-56 rounded-lg bg-[var(--color-surface)] animate-pulse" />
                        <div className="h-4 w-80 rounded-lg bg-[var(--color-surface)] animate-pulse" />
                    </div>
                    <div className="h-10 w-24 rounded-xl bg-[var(--color-surface)] animate-pulse" />
                </div>
                {/* Legend skeleton */}
                <div className="flex items-center justify-center gap-6">
                    <div className="h-4 w-24 rounded bg-[var(--color-surface)] animate-pulse" />
                    <div className="h-4 w-28 rounded bg-[var(--color-surface)] animate-pulse" />
                </div>
                {/* Radial skeleton */}
                <div className="relative w-full max-w-lg mx-auto" style={{ aspectRatio: "1" }}>
                    <div className="absolute rounded-full border-2 border-dashed border-[var(--color-surface)] opacity-40" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: "82%", height: "82%" }} />
                    <div className="absolute rounded-full bg-[var(--color-surface)] animate-pulse" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: "20%", height: "20%" }} />
                    {Array.from({ length: 10 }).map((_, i) => {
                        const angle = (i / 10) * 360 - 90;
                        const rad = (angle * Math.PI) / 180;
                        return (
                            <div key={i} className="absolute" style={{ left: `${50 + 38 * Math.cos(rad)}%`, top: `${50 + 38 * Math.sin(rad)}%`, transform: "translate(-50%, -50%)" }}>
                                <div className="h-16 w-16 rounded-full bg-[var(--color-surface)] animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <Header
                title="إدارة الموارد البشرية"
                description="أقسام الموارد البشرية - اضغط على القسم المتاح للاطلاع على التفاصيل"
                actions={
                    <Button
                        variant="outline"
                        onClick={() => navigate(routesData.dashboard)}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        العودة للوحة الرئيسية
                    </Button>
                }
            />

            {/* Lock/Unlock Legend */}
            <div className="flex items-center justify-center gap-6 text-xs text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1.5">
                    <LockOpen className="h-3.5 w-3.5 text-emerald-500" />
                    متاح للعرض
                </span>
                <span className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    يتطلب صلاحية
                </span>
            </div>

            {/* Radial Layout */}
            <div className="relative w-full max-w-lg mx-auto" style={{ aspectRatio: "1" }}>

                {/* Outer decorative ring - gradient */}
                <div
                    className="absolute rounded-full opacity-10"
                    style={{
                        left: "50%", top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "82%", height: "82%",
                        border: "1px solid var(--color-primary)",
                    }}
                />

                {/* Middle decorative ring - dashed */}
                <div
                    className="absolute rounded-full border border-dashed border-[var(--color-border)] opacity-20"
                    style={{
                        left: "50%", top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "60%", height: "60%",
                    }}
                />

                {/* Connecting lines from center to each section */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                    {HR_SECTIONS.map((_, index) => {
                        const angle = (index / HR_SECTIONS.length) * 360 - 90;
                        const rad = (angle * Math.PI) / 180;
                        const innerR = 15;
                        const outerR = 32;
                        return (
                            <line
                                key={index}
                                x1={`${50 + innerR * Math.cos(rad)}%`}
                                y1={`${50 + innerR * Math.sin(rad)}%`}
                                x2={`${50 + outerR * Math.cos(rad)}%`}
                                y2={`${50 + outerR * Math.sin(rad)}%`}
                                stroke="var(--color-border)"
                                strokeWidth="1"
                                opacity="0.15"
                                strokeDasharray="4 4"
                            />
                        );
                    })}
                </svg>

                {/* Center circle - glassmorphism */}
                <div
                    className="absolute rounded-full flex items-center justify-center z-10 center-pulse"
                    style={{
                        left: "50%", top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "20%", height: "20%",
                    }}
                >
                    {/* Outer glow ring */}
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: "conic-gradient(from 0deg, #3B82F6, #8B5CF6, #EC4899, #F97316, #10B981, #3B82F6)",
                            opacity: 0.6,
                            animation: "spin 8s linear infinite",
                        }}
                    />
                    {/* Inner content */}
                    <div
                        className="absolute rounded-full flex items-center justify-center"
                        style={{
                            inset: "3px",
                            backgroundColor: "var(--color-bg)",
                        }}
                    >
                        <div className="text-center">
                            <p className="text-xs sm:text-sm font-bold text-[var(--color-text-dark)] leading-tight">الموارد</p>
                            <p className="text-xs sm:text-sm font-bold text-[var(--color-primary)] leading-tight">البشرية</p>
                        </div>
                    </div>
                </div>

                {/* Section circles */}
                {sections.map((section, index) => (
                    <SectionCircle
                        key={section.id}
                        section={section}
                        index={index}
                        total={sections.length}
                        onNavigate={handleSectionClick}
                    />
                ))}
            </div>

            <style>{`
                @keyframes ring-fill {
                    from { stroke-dashoffset: ${2 * Math.PI * 33}; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .center-pulse {
                    animation: center-glow 3s ease-in-out infinite;
                }
                @keyframes center-glow {
                    0%, 100% { filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.2)); }
                    50% { filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.4)); }
                }
            `}</style>
        </div>
    );
}
