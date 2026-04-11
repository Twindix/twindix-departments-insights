import { useEffect, useRef, useState } from "react";

/**
 * Tracks the rendered size of a container element via ResizeObserver.
 * Used by all chart primitives so they can compute layout from real pixels.
 */
export function useChartSize<T extends HTMLElement = HTMLDivElement>() {
    const ref = useRef<T>(null);
    const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                const { width, height } = entry.contentRect;
                setSize({ width, height });
            }
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return [ref, size] as const;
}
