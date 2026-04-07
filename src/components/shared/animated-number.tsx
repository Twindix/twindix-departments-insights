import { useCountUp } from "@/hooks";
import { cn } from "@/utils";

interface AnimatedNumberProps {
    value: number;
    className?: string;
    suffix?: string;
    prefix?: string;
    decimals?: number;
    duration?: number;
}

export function AnimatedNumber({
    value,
    className,
    suffix = "",
    prefix = "",
    decimals = 0,
    duration = 1000,
}: AnimatedNumberProps) {
    const animatedValue = useCountUp(value, { duration, decimals });

    return (
        <span className={cn("tabular-nums", className)}>
            {prefix}
            {animatedValue.toLocaleString("ar-EG", {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            })}
            {suffix}
        </span>
    );
}
