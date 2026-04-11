// USD → SAR conversion. Update USD_TO_SAR if the rate needs to change.
export const USD_TO_SAR = 3.75;

export function convertUsdToSar(usd: number): number {
    return usd * USD_TO_SAR;
}

interface FormatSarOptions {
    compact?: boolean;
    decimals?: number;
}

/**
 * Format a SAR amount in Arabic locale.
 * - compact: collapses to ألف / مليون / مليار for large values
 * - decimals: number of fraction digits (default 0)
 */
export function formatSar(amount: number, opts: FormatSarOptions = {}): string {
    const { compact = false, decimals = 0 } = opts;

    if (compact) {
        const abs = Math.abs(amount);
        if (abs >= 1_000_000_000) {
            return `${(amount / 1_000_000_000).toLocaleString("ar-EG", { maximumFractionDigits: 2 })} مليار ر.س`;
        }
        if (abs >= 1_000_000) {
            return `${(amount / 1_000_000).toLocaleString("ar-EG", { maximumFractionDigits: 2 })} مليون ر.س`;
        }
        if (abs >= 1_000) {
            return `${(amount / 1_000).toLocaleString("ar-EG", { maximumFractionDigits: 1 })} ألف ر.س`;
        }
    }

    return `${amount.toLocaleString("ar-EG", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })} ر.س`;
}

/** Convenience: take a USD amount and return its SAR-formatted string. */
export function formatUsdAsSar(usd: number, opts?: FormatSarOptions): string {
    return formatSar(convertUsdToSar(usd), opts);
}
