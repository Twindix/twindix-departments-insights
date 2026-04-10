import { useState, useEffect, useRef } from "react";
import { cn } from "@/utils";

interface ScoreGaugeProps {
    score: number;
    size?: "sm" | "md" | "lg";
    label?: string;
    className?: string;
    showPercentage?: boolean;
}

function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

function getScoreColor(score: number): string {
    if (score >= 80) return "var(--color-success)";
    if (score >= 60) return "var(--color-warning)";
    return "var(--color-error)";
}

const sizeMap = {
    sm: { container: "w-16 h-16", text: "text-sm", label: "text-[10px]" },
    md: { container: "w-24 h-24", text: "text-lg", label: "text-xs" },
    lg: { container: "w-32 h-32", text: "text-2xl", label: "text-sm" },
};

export function ScoreGauge({
    score,
    size = "md",
    label,
    className,
    showPercentage = true,
}: ScoreGaugeProps) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        const startTime = performance.now();
        const duration = 1000;

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            setAnimatedScore(Math.round(score * eased));

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [score]);

    const angle = (animatedScore / 100) * 360;
    const color = getScoreColor(score);
    const sizes = sizeMap[size];

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center",
                className,
            )}
        >
            <div
                className={cn(
                    "relative flex items-center justify-center rounded-full",
                    sizes.container,
                )}
                style={{
                    background: `conic-gradient(${color} ${angle}deg, var(--color-surface) ${angle}deg)`,
                }}
            >
                <div
                    className={cn(
                        "absolute rounded-full bg-[var(--color-bg)] flex items-center justify-center",
                        size === "sm" && "w-11 h-11",
                        size === "md" && "w-17 h-17",
                        size === "lg" && "w-24 h-24",
                    )}
                >
                    {showPercentage && (
                        <span
                            className={cn(
                                "font-bold tabular-nums",
                                sizes.text,
                            )}
                            style={{ color }}
                        >
                            {animatedScore}%
                        </span>
                    )}
                </div>
            </div>
            {label && (
                <span
                    className={cn(
                        "mt-2 text-center text-[var(--color-text-secondary)] font-medium",
                        sizes.label,
                    )}
                >
                    {label}
                </span>
            )}
        </div>
    );
}
