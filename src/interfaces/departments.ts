export interface DepartmentInterface {
    id: string;
    name: string;
    icon: string;
    color: string;
    isAccessible: boolean;
    overallPerformance: number;
    employeeCount: number;
    subDepartments?: SubDepartmentInterface[];
}

export interface SubDepartmentInterface {
    id: string;
    name: string;
    parentDepartmentId: string;
    overallPerformance: number;
}

export interface DepartmentDailyRecordInterface {
    id: string;
    employeeId: string;
    employeeName: string;
    departmentName: string;
    subDepartmentId: string;
    date: string;
    registrationStatus: string;
    attendanceDays: number;
    totalTasks: number;
    executedTasks: number;
    unexecutedTasks: number;
    planned: number;
    unplanned: number;
    dailyWorkHours: number;
    actualHours: number;
    lostHours: number;
    workPercentage: number;
    executedWorkPercentage: number;
    plannedWorkPercentage: number;
    unplannedWorkPercentage: number;
}
