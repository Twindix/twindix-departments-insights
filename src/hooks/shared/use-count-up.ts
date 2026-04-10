import { useState, useEffect, useRef } from "react";

function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

interface UseCountUpOptions {
    duration?: number;
    decimals?: number;
}

export function useCountUp(
    target: number,
    options: UseCountUpOptions = {},
): number {
    const { duration = 1000, decimals = 0 } = options;
    const [current, setCurrent] = useState(0);
    const previousTarget = useRef(0);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        const startValue = previousTarget.current;
        const startTime = performance.now();

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);
            const value =
                startValue + (target - startValue) * easedProgress;

            const factor = Math.pow(10, decimals);
            setCurrent(Math.round(value * factor) / factor);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                previousTarget.current = target;
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [target, duration, decimals]);

    return current;
}
