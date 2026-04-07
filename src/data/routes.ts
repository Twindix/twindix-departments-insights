export const routesData = {
    login: "/login",
    dashboard: "/",
    departmentHr: "/departments/hr",
    departmentHrPerformance: "/departments/hr/sections/performance-management",
    departmentProjects: "/departments/projects",
    departmentFinance: "/departments/finance",
    employeeProfile: "/employees/:id/profile",
    employeeInsights: "/employees/:id/insights",
    settings: "/settings",
    profile: "/profile",
} as const;

export function getEmployeeProfilePath(id: string): string {
    return `/employees/${id}/profile`;
}

export function getEmployeeInsightsPath(id: string): string {
    return `/employees/${id}/insights`;
}
