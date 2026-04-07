export const routesData = {
    login: "/login",
    dashboard: "/",
    departmentHr: "/departments/hr",
    memberProfile: "/members/:id/profile",
    memberInsights: "/members/:id/insights",
    settings: "/settings",
    profile: "/profile",
} as const;

export function getMemberProfilePath(id: string): string {
    return `/members/${id}/profile`;
}

export function getMemberInsightsPath(id: string): string {
    return `/members/${id}/insights`;
}
