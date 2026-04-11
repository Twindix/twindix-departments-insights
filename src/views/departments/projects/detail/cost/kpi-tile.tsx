import type { ReactNode } from "react";
import { cn } from "@/utils";

interface KpiTileProps {
    label: string;
    value: ReactNode;
    sublabel?: ReactNode;
    icon?: ReactNode;
    tone?: "neutral" | "success" | "warning" | "error" | "info";
    className?: string;
}

const TONE_CLASS: Record<NonNullable<KpiTileProps["tone"]>, string> = {
    neutral: "border-[var(--color-border)]",
    success: "border-[var(--color-success)]/40 bg-[var(--color-success)]/5",
    warning: "border-[var(--color-warning)]/40 bg-[var(--color-warning)]/5",
    error: "border-[var(--color-error)]/40 bg-[var(--color-error)]/5",
    info: "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5",
};

export function KpiTile({ label, value, sublabel, icon, tone = "neutral", className }: KpiTileProps) {
    return (
        <div
            className={cn(
                "rounded-xl border p-4 transition-colors",
                TONE_CLASS[tone],
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">{label}</p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-[var(--color-text-primary)]">
                        {value}
                    </p>
                    {sublabel && (
                        <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">{sublabel}</p>
                    )}
                </div>
                {icon && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface)] text-[var(--color-primary)]">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
