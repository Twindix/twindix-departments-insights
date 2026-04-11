export const routesData = {
    login: "/login",
    dashboard: "/",
    departmentHr: "/departments/hr",
    departmentHrPerformance: "/departments/hr/sections/performance-management",
    departmentProjects: "/departments/projects",
    departmentProjectDetail: "/departments/projects/:id",
    departmentProjectCost: "/departments/projects/:id/cost",
    departmentProjectQuality: "/departments/projects/:id/quality",
    departmentProjectTime: "/departments/projects/:id/time",
    departmentFinance: "/departments/finance",
    employeeProfile: "/employees/:id",
    employeeInsights: "/employees/:id/insights",
    settings: "/settings",
    profile: "/profile",
} as const;

export function getEmployeeProfilePath(id: string): string {
    return `/employees/${id}`;
}

export function getEmployeeInsightsPath(id: string): string {
    return `/employees/${id}/insights`;
}

export function getProjectDetailPath(id: string): string {
    return `/departments/projects/${id}`;
}

export function getProjectCostPath(id: string): string {
    return `/departments/projects/${id}/cost`;
}

export function getProjectQualityPath(id: string): string {
    return `/departments/projects/${id}/quality`;
}

export function getProjectTimePath(id: string): string {
    return `/departments/projects/${id}/time`;
}
