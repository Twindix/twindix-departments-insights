import { Lock, LockOpen } from "lucide-react";
import { ScoreGauge } from "./score-gauge";
import { cn } from "@/utils";

interface DepartmentCircleProps {
    name: string;
    performance: number;
    color: string;
    isAccessible: boolean;
    employeeCount: number;
    onClick: () => void;
    className?: string;
}

export function DepartmentCircle({
    name,
    performance,
    color: _color,
    isAccessible,
    employeeCount,
    onClick,
    className,
}: DepartmentCircleProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "dept-circle group relative flex flex-col items-center gap-3 rounded-2xl border bg-[var(--color-bg)] p-6 cursor-pointer transition-all duration-200",
                isAccessible && "border-[var(--color-success)] ring-2 ring-[var(--color-success)]/30 hover:ring-[var(--color-success)]/50 hover:scale-[1.03]",
                !isAccessible && "border-[var(--color-border)]",
                !isAccessible && "opacity-85",
                className
            )}
        >
            <div className="relative">
                <ScoreGauge score={performance} size="md" />
                {isAccessible && (
                    <div className="absolute -top-1.5 -left-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-success)] border-2 border-[var(--color-bg)] shadow-sm">
                        <LockOpen className="h-3.5 w-3.5 text-white" />
                    </div>
                )}
            </div>

            <div className="text-center">
                <p className="text-sm font-semibold text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)] transition-colors">
                    {name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {employeeCount} موظف
                </p>
            </div>

            {/* Hover indicator */}
            <div
                className="h-1 w-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: isAccessible ? "var(--color-success)" : "var(--color-text-muted)" }}
            />

            {/* Grey lock circle for inaccessible departments */}
            {!isAccessible && (
                <div className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-surface-active)] border border-[var(--color-border)]">
                    <Lock className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                </div>
            )}
        </button>
    );
}
