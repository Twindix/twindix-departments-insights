export function formatDate(
    dateString: string,
    format: "short" | "long" | "iso" = "short",
): string {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return dateString;

    switch (format) {
        case "long":
            return date.toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
            });
        case "iso":
            return date.toISOString().split("T")[0];
        case "short":
        default:
            return date.toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
    }
}

export function formatPercentage(value: number): string {
    return `${Math.round(value * 100)}%`;
}

export function formatNumber(value: number, decimals = 0): string {
    return value.toLocaleString("ar-EG", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}
