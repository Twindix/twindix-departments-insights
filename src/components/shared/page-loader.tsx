import { Loader2 } from "lucide-react";

interface SkeletonBoxProps {
    className?: string;
    style?: React.CSSProperties;
}

function S({ className = "", style }: SkeletonBoxProps) {
    return <div className={`rounded-lg bg-[var(--color-surface)] animate-pulse ${className}`} style={style} />;
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="space-y-2">
                <S className="h-8 w-52" />
                <S className="h-4 w-80" />
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <S key={i} className="h-24 rounded-xl" />
                ))}
            </div>

            {/* Department circles */}
            <div>
                <S className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <S key={i} className="h-48 rounded-2xl" style={{ animationDelay: `${i * 0.05}s` }} />
                    ))}
                </div>
            </div>

            <LoadingSpinner text="جاري تحميل لوحة التحكم..." />
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in max-w-2xl">
            {/* Header */}
            <div className="space-y-2">
                <S className="h-8 w-36" />
                <S className="h-4 w-48" />
            </div>

            {/* Avatar card */}
            <S className="h-52 rounded-xl" />

            {/* Account card */}
            <div className="rounded-xl border border-[var(--color-border)] p-6 space-y-5">
                <S className="h-6 w-24" />
                <S className="h-10 w-full rounded-xl" />
                <S className="h-10 w-full rounded-xl" />
                <S className="h-10 w-full rounded-xl" />
                <S className="h-11 w-full rounded-xl" />
            </div>

            <LoadingSpinner text="جاري تحميل الملف الشخصي..." />
        </div>
    );
}

export function MemberProfileSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <S className="h-8 w-64" />
                    <S className="h-4 w-48" />
                </div>
                <div className="flex gap-2">
                    <S className="h-10 w-36 rounded-xl" />
                    <S className="h-10 w-24 rounded-xl" />
                </div>
            </div>

            {/* Date filter */}
            <S className="h-28 rounded-xl" />

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <S key={i} className="h-24 rounded-xl" />
                ))}
            </div>

            {/* Chart */}
            <S className="h-72 rounded-xl" />

            {/* Bars */}
            <S className="h-64 rounded-xl" />

            <LoadingSpinner text="جاري تحميل بيانات الموظف..." />
        </div>
    );
}

export function MemberInsightsSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <S className="h-8 w-56" />
                    <S className="h-4 w-72" />
                </div>
                <div className="flex gap-2">
                    <S className="h-10 w-28 rounded-xl" />
                    <S className="h-10 w-24 rounded-xl" />
                </div>
            </div>

            {/* Tabs */}
            <S className="h-10 w-full rounded-xl" />

            {/* Content */}
            <div className="grid gap-6 md:grid-cols-3">
                <S className="h-64 rounded-xl md:col-span-2" />
                <S className="h-64 rounded-xl" />
            </div>

            <LoadingSpinner text="جاري تحميل تحليلات الأداء..." />
        </div>
    );
}

export function SettingsSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in max-w-2xl">
            <div className="space-y-2">
                <S className="h-8 w-28" />
                <S className="h-4 w-44" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
                <S key={i} className="h-36 rounded-xl" />
            ))}
            <LoadingSpinner text="جاري تحميل الإعدادات..." />
        </div>
    );
}

function LoadingSpinner({ text }: { text: string }) {
    return (
        <div className="flex items-center justify-center gap-3 pt-2">
            <Loader2 className="h-5 w-5 text-[var(--color-primary)] animate-spin" />
            <span className="text-sm text-[var(--color-text-muted)]">{text}</span>
        </div>
    );
}
