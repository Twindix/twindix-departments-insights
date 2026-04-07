import { useState, useEffect } from "react";
import { cn } from "@/utils";

interface ProgressBarProps {
    value: number;
    max?: number;
    label?: string;
    showPercentage?: boolean;
    color?: string;
    size?: "sm" | "md" | "lg";
    animated?: boolean;
    className?: string;
}

function getAutoColor(percentage: number): string {
    if (percentage >= 80) return "var(--color-success)";
    if (percentage >= 60) return "var(--color-warning)";
    return "var(--color-error)";
}

const heightMap = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
};

export function ProgressBar({
    value,
    max = 100,
    label,
    showPercentage = true,
    color,
    size = "md",
    animated = true,
    className,
}: ProgressBarProps) {
    const percentage = Math.min(Math.round((value / max) * 100), 100);
    const [width, setWidth] = useState(animated ? 0 : percentage);
    const barColor = color ?? getAutoColor(percentage);

    useEffect(() => {
        if (animated) {
            const timer = requestAnimationFrame(() => setWidth(percentage));
            return () => cancelAnimationFrame(timer);
        }
        setWidth(percentage);
    }, [percentage, animated]);

    return (
        <div className={cn("w-full", className)}>
            {(label || showPercentage) && (
                <div className="mb-1.5 flex items-center justify-between text-sm">
                    {label && (
                        <span className="font-medium text-[var(--color-text-secondary)]">
                            {label}
                        </span>
                    )}
                    {showPercentage && (
                        <span
                            className="tabular-nums font-semibold"
                            style={{ color: barColor }}
                        >
                            {percentage}%
                        </span>
                    )}
                </div>
            )}
            <div
                className={cn(
                    "progress-bar-track w-full",
                    heightMap[size]
                )}
            >
                <div
                    className="progress-bar-fill"
                    style={{
                        width: `${width}%`,
                        backgroundColor: barColor,
                        transition: animated
                            ? "width 1s ease-out"
                            : "none",
                    }}
                />
            </div>
        </div>
    );
}
