import type { ReactNode } from "react";
import { cn } from "@/utils";

interface KpiTileProps {
    label: string;
    value: ReactNode;
    sublabel?: ReactNode;
    icon?: ReactNode;
    className?: string;
}

export function KpiTile({ label, value, sublabel, icon, className }: KpiTileProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-4 transition-colors",
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] text-[var(--color-text-muted)]">{label}</p>
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
