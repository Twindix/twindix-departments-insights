import type { LucideIcon } from "lucide-react";
import { Card } from "@/atoms";
import { AnimatedNumber } from "./animated-number";
import { cn } from "@/utils";

interface StatCardProps {
    label: string;
    value: number;
    icon: LucideIcon;
    suffix?: string;
    prefix?: string;
    decimals?: number;
    color?: string;
    className?: string;
}

export function StatCard({
    label,
    value,
    icon: Icon,
    suffix,
    prefix,
    decimals = 0,
    color,
    className,
}: StatCardProps) {
    return (
        <Card
            className={cn(
                "hover-lift p-4 flex items-start gap-3",
                className
            )}
        >
            <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                    backgroundColor: color
                        ? `${color}20`
                        : "var(--color-primary-light)",
                }}
            >
                <Icon
                    className="h-5 w-5"
                    style={{
                        color: color ?? "var(--color-primary)",
                    }}
                />
            </div>
            <div className="min-w-0">
                <p className="text-sm text-[var(--color-text-muted)] mb-0.5">
                    {label}
                </p>
                <p className="text-xl font-bold text-[var(--color-text-dark)]">
                    <AnimatedNumber
                        value={value}
                        suffix={suffix}
                        prefix={prefix}
                        decimals={decimals}
                    />
                </p>
            </div>
        </Card>
    );
}
