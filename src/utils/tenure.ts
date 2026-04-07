export interface TenureInfo {
    years: number;
    months: number;
    totalMonths: number;
    isNewJoiner: boolean;
    isSenior: boolean;
    label: string;
}

export function getTenureInfo(joiningDate: string): TenureInfo {
    const now = new Date();
    const joined = new Date(joiningDate);
    const diffMs = now.getTime() - joined.getTime();
    const totalMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const isNewJoiner = totalMonths <= 3;
    const isSenior = years >= 10;

    let label: string;
    if (years > 0 && months > 0) {
        label = `${years} سنة و ${months} شهر`;
    } else if (years > 0) {
        label = `${years} سنة`;
    } else {
        label = `${totalMonths} شهر`;
    }

    return { years, months, totalMonths, isNewJoiner, isSenior, label };
}

export type TenureFilter = "all" | "new" | "senior" | "regular";

export const TENURE_FILTER_LABELS: Record<TenureFilter, string> = {
    all: "جميع مدد الخدمة",
    new: "موظفين جدد",
    senior: "موظفين قدامى",
    regular: "موظفين عاديين",
};
