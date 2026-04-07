import { useState, useEffect } from "react";

export function useDeferredLoad(delay = 150): boolean {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            const timer = setTimeout(() => setIsReady(true), delay);
            return () => clearTimeout(timer);
        });
        return () => cancelAnimationFrame(frame);
    }, [delay]);

    return isReady;
}
