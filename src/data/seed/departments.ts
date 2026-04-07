import type { DepartmentInterface, SubDepartmentInterface } from "@/interfaces";
import { DEPARTMENT_EMPLOYEE_COUNTS } from "./employees";



export const seedDepartments: DepartmentInterface[] = [
    { id: "dept-hr", name: "إدارة الموارد البشرية", icon: "Users", color: "#10B981", isAccessible: true, overallPerformance: 74, employeeCount: DEPARTMENT_EMPLOYEE_COUNTS["dept-hr"] },
    { id: "dept-sales", name: "المبيعات", icon: "TrendingUp", color: "#059669", isAccessible: false, overallPerformance: 58, employeeCount: DEPARTMENT_EMPLOYEE_COUNTS["dept-sales"] },
    { id: "dept-it", name: "إدارة IT", icon: "Monitor", color: "#6366F1", isAccessible: false, overallPerformance: 72, employeeCount: DEPARTMENT_EMPLOYEE_COUNTS["dept-it"] },
    { id: "dept-finance", name: "إدارة المالية", icon: "Banknote", color: "#EF4444", isAccessible: true, overallPerformance: 81, employeeCount: DEPARTMENT_EMPLOYEE_COUNTS["dept-finance"] },
    { id: "dept-projects", name: "إدارة المشروعات", icon: "FolderKanban", color: "#F59E0B", isAccessible: true, overallPerformance: 68, employeeCount: DEPARTMENT_EMPLOYEE_COUNTS["dept-projects"] },
    { id: "dept-customer", name: "إدارة خدمة العملاء", icon: "Headphones", color: "#3B82F6", isAccessible: false, overallPerformance: 74, employeeCount: DEPARTMENT_EMPLOYEE_COUNTS["dept-customer"] },
    { id: "dept-commercial", name: "إدارة القطاع التجاري", icon: "Store", color: "#14B8A6", isAccessible: false, overallPerformance: 65, employeeCount: DEPARTMENT_EMPLOYEE_COUNTS["dept-commercial"] },
    { id: "dept-marketing", name: "التسويق", icon: "Megaphone", color: "#8B5CF6", isAccessible: false, overallPerformance: 82, employeeCount: DEPARTMENT_EMPLOYEE_COUNTS["dept-marketing"] },
    { id: "dept-admin", name: "الشؤون الإدارية", icon: "Building2", color: "#EC4899", isAccessible: false, overallPerformance: 76, employeeCount: DEPARTMENT_EMPLOYEE_COUNTS["dept-admin"] },
];

export const seedSubDepartments: SubDepartmentInterface[] = [
    { id: "dept-hr", name: "إدارة الموارد البشرية", parentDepartmentId: "dept-hr", overallPerformance: 74 },
    { id: "dept-sales", name: "المبيعات", parentDepartmentId: "dept-hr", overallPerformance: 58 },
    { id: "dept-it", name: "إدارة IT", parentDepartmentId: "dept-hr", overallPerformance: 72 },
    { id: "dept-finance", name: "إدارة المالية", parentDepartmentId: "dept-hr", overallPerformance: 81 },
    { id: "dept-projects", name: "إدارة المشروعات", parentDepartmentId: "dept-hr", overallPerformance: 68 },
    { id: "dept-customer", name: "إدارة خدمة العملاء", parentDepartmentId: "dept-hr", overallPerformance: 74 },
    { id: "dept-commercial", name: "إدارة القطاع التجاري", parentDepartmentId: "dept-hr", overallPerformance: 65 },
    { id: "dept-marketing", name: "التسويق", parentDepartmentId: "dept-hr", overallPerformance: 82 },
    { id: "dept-admin", name: "الشؤون الإدارية", parentDepartmentId: "dept-hr", overallPerformance: 76 },
];
