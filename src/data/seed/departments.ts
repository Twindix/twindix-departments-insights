import type { DepartmentInterface, SubDepartmentInterface } from "@/interfaces";
import { DEPARTMENT_EMPLOYEE_COUNTS, seedEmployees } from "./employees";
import { seedDepartmentRecords } from "./department-records";
import { seedProjects } from "./projects";

// ── Step 1: Compute "تقييم وإدارة الأداء" = table "الكل" avg (all 700 employees last week) ──

const _weekAgoMs = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
const _empPerf = new Map<string, number[]>();
for (const r of seedDepartmentRecords) {
    if (r.executedWorkPercentage > 0 && new Date(r.date).getTime() >= _weekAgoMs) {
        const a = _empPerf.get(r.employeeId);
        if (a) a.push(r.executedWorkPercentage);
        else _empPerf.set(r.employeeId, [r.executedWorkPercentage]);
    }
}
let _totalPerf = 0;
for (const [, recs] of _empPerf) {
    _totalPerf += Math.round((recs.reduce((s, v) => s + v, 0) / recs.length) * 100);
}
// This is the "تقييم وإدارة الأداء" HR section value AND the table's "الكل" progress bar
export const tableAllAvg = seedEmployees.length > 0 ? Math.round(_totalPerf / seedEmployees.length) : 0;

// ── Step 2: Compute HR card = avg of all 10 HR section percentages ──

const HR_SECTION_PERCENTAGES = [82, 76, 69, 71, tableAllAvg, 65, 78, 80, 67, 72];
const hrCardPercentage = Math.round(HR_SECTION_PERCENTAGES.reduce((s, v) => s + v, 0) / HR_SECTION_PERCENTAGES.length);

// ── Step 3: Compute Finance card = avg of 4 indicators ──

const FINANCE_INDICATORS = [85, 82, 78, 79];
const financeCardPercentage = Math.round(FINANCE_INDICATORS.reduce((s, v) => s + v, 0) / FINANCE_INDICATORS.length);

// ── Step 4: Compute Projects card = avg of all project avgPerformance values ──

const projectsCardPercentage = seedProjects.length > 0
    ? Math.round(seedProjects.reduce((s, p) => s + p.avgPerformance, 0) / seedProjects.length)
    : 0;

// ── Step 5: Other departments — static percentages (not from employee data) ──
// These are random/assigned values that will get their real calculation when access is opened

const DEPT_CARD_PERCENTAGES: Record<string, number> = {
    "dept-hr": hrCardPercentage,
    "dept-sales": 86,
    "dept-it": 74,
    "dept-finance": financeCardPercentage,
    "dept-projects": projectsCardPercentage,
    "dept-customer": 55,
    "dept-commercial": 61,
    "dept-marketing": 88,
    "dept-admin": 42,
};

// ── Build department arrays ──

const DEPT_META: { id: string; name: string; icon: string; color: string; isAccessible: boolean }[] = [
    { id: "dept-hr", name: "إدارة الموارد البشرية", icon: "Users", color: "#10B981", isAccessible: true },
    { id: "dept-sales", name: "المبيعات", icon: "TrendingUp", color: "#059669", isAccessible: false },
    { id: "dept-it", name: "إدارة IT", icon: "Monitor", color: "#6366F1", isAccessible: false },
    { id: "dept-finance", name: "إدارة المالية", icon: "Banknote", color: "#EF4444", isAccessible: true },
    { id: "dept-projects", name: "إدارة المشروعات", icon: "FolderKanban", color: "#F59E0B", isAccessible: true },
    { id: "dept-customer", name: "إدارة خدمة العملاء", icon: "Headphones", color: "#3B82F6", isAccessible: false },
    { id: "dept-commercial", name: "إدارة القطاع التجاري", icon: "Store", color: "#14B8A6", isAccessible: false },
    { id: "dept-marketing", name: "التسويق", icon: "Megaphone", color: "#8B5CF6", isAccessible: false },
    { id: "dept-admin", name: "الشؤون الإدارية", icon: "Building2", color: "#EC4899", isAccessible: false },
];

export const seedDepartments: DepartmentInterface[] = DEPT_META.map((d) => ({
    ...d,
    overallPerformance: DEPT_CARD_PERCENTAGES[d.id] ?? 0,
    employeeCount: DEPARTMENT_EMPLOYEE_COUNTS[d.id],
}));

export const seedSubDepartments: SubDepartmentInterface[] = DEPT_META.map((d) => ({
    id: d.id,
    name: d.name,
    parentDepartmentId: "dept-hr",
    overallPerformance: DEPT_CARD_PERCENTAGES[d.id] ?? 0,
}));
