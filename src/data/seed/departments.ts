import type { DepartmentInterface, SubDepartmentInterface } from "@/interfaces";
import { DEPARTMENT_MEMBER_COUNTS } from "./members";



export const seedDepartments: DepartmentInterface[] = [
    { id: "dept-hr", name: "إدارة الموارد البشرية", icon: "Users", color: "#10B981", isAccessible: true, overallPerformance: 74, memberCount: DEPARTMENT_MEMBER_COUNTS["dept-hr"] },
    { id: "dept-it", name: "إدارة IT", icon: "Monitor", color: "#6366F1", isAccessible: false, overallPerformance: 72, memberCount: DEPARTMENT_MEMBER_COUNTS["dept-it"] },
    { id: "dept-finance", name: "إدارة المالية", icon: "Banknote", color: "#EF4444", isAccessible: false, overallPerformance: 81, memberCount: DEPARTMENT_MEMBER_COUNTS["dept-finance"] },
    { id: "dept-projects", name: "إدارة المشروعات", icon: "FolderKanban", color: "#F59E0B", isAccessible: false, overallPerformance: 68, memberCount: DEPARTMENT_MEMBER_COUNTS["dept-projects"] },
    { id: "dept-customer", name: "إدارة خدمة العملاء", icon: "Headphones", color: "#3B82F6", isAccessible: false, overallPerformance: 74, memberCount: DEPARTMENT_MEMBER_COUNTS["dept-customer"] },
    { id: "dept-commercial", name: "إدارة القطاع التجاري", icon: "Store", color: "#14B8A6", isAccessible: false, overallPerformance: 65, memberCount: DEPARTMENT_MEMBER_COUNTS["dept-commercial"] },
    { id: "dept-marketing", name: "التسويق", icon: "Megaphone", color: "#8B5CF6", isAccessible: false, overallPerformance: 82, memberCount: DEPARTMENT_MEMBER_COUNTS["dept-marketing"] },
    { id: "dept-admin", name: "الشؤون الإدارية", icon: "Building2", color: "#EC4899", isAccessible: false, overallPerformance: 76, memberCount: DEPARTMENT_MEMBER_COUNTS["dept-admin"] },
    { id: "dept-sales", name: "المبيعات", icon: "TrendingUp", color: "#059669", isAccessible: false, overallPerformance: 58, memberCount: DEPARTMENT_MEMBER_COUNTS["dept-sales"] },
];

export const seedSubDepartments: SubDepartmentInterface[] = [
    { id: "dept-hr", name: "إدارة الموارد البشرية", parentDepartmentId: "dept-hr", overallPerformance: 74 },
    { id: "dept-it", name: "إدارة IT", parentDepartmentId: "dept-hr", overallPerformance: 72 },
    { id: "dept-finance", name: "إدارة المالية", parentDepartmentId: "dept-hr", overallPerformance: 81 },
    { id: "dept-projects", name: "إدارة المشروعات", parentDepartmentId: "dept-hr", overallPerformance: 68 },
    { id: "dept-customer", name: "إدارة خدمة العملاء", parentDepartmentId: "dept-hr", overallPerformance: 74 },
    { id: "dept-commercial", name: "إدارة القطاع التجاري", parentDepartmentId: "dept-hr", overallPerformance: 65 },
    { id: "dept-marketing", name: "التسويق", parentDepartmentId: "dept-hr", overallPerformance: 82 },
    { id: "dept-admin", name: "الشؤون الإدارية", parentDepartmentId: "dept-hr", overallPerformance: 76 },
    { id: "dept-sales", name: "المبيعات", parentDepartmentId: "dept-hr", overallPerformance: 58 },
];
