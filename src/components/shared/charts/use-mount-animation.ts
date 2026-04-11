import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * Returns an eased 0→1 progress value over `duration` ms after mount.
 * Used by chart primitives to animate bars / paths in.
 */
export function useMountAnimation(duration = 800): number {
    const [progress, setProgress] = useState(0);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        const start = performance.now();
        const animate = (now: number) => {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            setProgress(easeOutCubic(t));
            if (t < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };
        frameRef.current = requestAnimationFrame(animate);
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [duration]);

    return progress;
}
