import type { DepartmentDailyRecordInterface } from "@/interfaces";
import { seedEmployees } from "./employees";

// Deterministic pseudo-random number generator (mulberry32)
function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s |= 0;
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Generate dates spanning 3 years (max custom range):
// - Daily for last 2 weeks
// - Weekly for last 3 months
// - Bi-weekly for 3 months to 1 year
// - Monthly for 1 year to 3 years
// Total ~100 dates per employee — manageable bundle size
function generateDates(): string[] {
    const added = new Set<string>();
    const today = new Date();

    function addWorkingDay(d: Date) {
        const adj = new Date(d);
        const day = adj.getDay();
        if (day === 5) adj.setDate(adj.getDate() - 1);
        if (day === 6) adj.setDate(adj.getDate() + 2);
        const iso = adj.toISOString().split("T")[0];
        if (!added.has(iso)) added.add(iso);
    }

    // Last 15 working days — daily
    let d = new Date(today);
    d.setDate(d.getDate() - 1);
    let count = 0;
    while (count < 15) {
        const day = d.getDay();
        if (day !== 5 && day !== 6) { addWorkingDay(d); count++; }
        d.setDate(d.getDate() - 1);
    }

    // 2 weeks to 3 months — weekly
    d = new Date(today);
    d.setDate(d.getDate() - 21);
    for (let w = 0; w < 10; w++) {
        addWorkingDay(d);
        d.setDate(d.getDate() - 7);
    }

    // 3 months to 1 year — bi-weekly
    d = new Date(today);
    d.setMonth(d.getMonth() - 3);
    for (let w = 0; w < 20; w++) {
        addWorkingDay(d);
        d.setDate(d.getDate() - 14);
    }

    // 1 year to 3 years — monthly
    d = new Date(today);
    d.setFullYear(d.getFullYear() - 1);
    for (let m = 0; m < 24; m++) {
        addWorkingDay(d);
        d.setMonth(d.getMonth() - 1);
    }

    return Array.from(added).sort();
}

const DATES = generateDates();

// Department performance profiles — each department has a different bias
// This ensures departments have genuinely different overall performance levels
const DEPT_PERFORMANCE_BIAS: Record<string, number> = {
    "dept-hr": 6, // ~74% — mostly good
    "dept-it": 5, // ~72% — mixed
    "dept-finance": 7, // ~81% — strong
    "dept-projects": 3, // ~62% — weaker
    "dept-customer": 1, // ~50% — struggling
    "dept-commercial": 2, // ~58% — below average
    "dept-marketing": 8, // ~85% — top performer
    "dept-admin": 1, // ~50% — struggling
    "dept-sales": 8, // ~85% — top performer
};

function getEmployeeTier(employeeIndex: number, deptId: string): { minExec: number; maxExec: number; minHours: number; maxHours: number; absentRate: number } {
    const deptBias = DEPT_PERFORMANCE_BIAS[deptId] ?? 5;
    // Combine employee index variation with department bias
    const tierRoll = ((employeeIndex * 7 + 3) % 10);
    // Shift the roll by dept bias: high-bias depts have more excellent/good employees
    const adjusted = Math.min(9, Math.max(0, tierRoll + deptBias - 5));

    if (adjusted >= 8) {
        // Excellent: 88-100% execution
        return { minExec: 0.88, maxExec: 1.0, minHours: 7, maxHours: 8, absentRate: 0.05 };
    } else if (adjusted >= 5) {
        // Good: 72-90% execution
        return { minExec: 0.72, maxExec: 0.92, minHours: 6, maxHours: 8, absentRate: 0.12 };
    } else if (adjusted >= 2) {
        // Average: 48-72% execution
        return { minExec: 0.48, maxExec: 0.74, minHours: 4.5, maxHours: 7, absentRate: 0.25 };
    } else {
        // Weak: 25-50% execution
        return { minExec: 0.25, maxExec: 0.52, minHours: 3, maxHours: 5.5, absentRate: 0.40 };
    }
}

// Time-based performance drift per department
// Simulates real company trends: some depts improving, some declining over time
// driftDirection: positive = improving over time (recent > old), negative = declining
const DEPT_TIME_DRIFT: Record<string, number> = {
    "dept-hr": 0.12, // HR improving steadily
    "dept-it": 0.08, // IT slight improvement
    "dept-finance": 0.05, // Finance stable, tiny improvement
    "dept-projects": -0.10, // Projects declining (overloaded)
    "dept-customer": -0.15, // Customer service declining
    "dept-commercial": 0.15, // Commercial improving fast
    "dept-marketing": 0.10, // Marketing improving
    "dept-admin": -0.08, // Admin slightly declining
    "dept-sales": 0.20, // Sales big improvement recently
};

function getTimeDriftMultiplier(date: string, deptId: string): number {
    const now = new Date();
    const recordDate = new Date(date);
    const daysAgo = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);
    const yearsAgo = daysAgo / 365;
    const drift = DEPT_TIME_DRIFT[deptId] ?? 0;
    // drift applies per year: recent records get +drift, old records get -drift
    // Clamp between -0.3 and +0.3 to avoid extreme values
    return Math.max(-0.3, Math.min(0.3, drift * (1 - yearsAgo)));
}

function generateRecords(): DepartmentDailyRecordInterface[] {
    const records: DepartmentDailyRecordInterface[] = [];
    let recordId = 1;

    for (let mi = 0; mi < seedEmployees.length; mi++) {
        const employee = seedEmployees[mi];
        const tier = getEmployeeTier(mi, employee.subDepartmentId);

        for (let di = 0; di < DATES.length; di++) {
            const date = DATES[di];
            const rand = seededRandom(mi * 1000 + di * 37 + 42);

            const statusRoll = rand();
            let registrationStatus: string;

            if (statusRoll < (1 - tier.absentRate - 0.1)) {
                registrationStatus = "تم";
            } else if (statusRoll < (1 - tier.absentRate * 0.4)) {
                registrationStatus = "لم يتم";
            } else {
                registrationStatus = "أجازة";
            }

            const isActive = registrationStatus === "تم";

            const totalTasks = isActive ? Math.floor(rand() * 8) + 3 : 0;
            // Apply time drift: recent records in improving depts get higher execution rates
            const timeDrift = getTimeDriftMultiplier(date, employee.subDepartmentId);
            const baseRate = isActive ? tier.minExec + rand() * (tier.maxExec - tier.minExec) : 0;
            const executionRate = Math.max(0.05, Math.min(1.0, baseRate + timeDrift));
            const executedTasks = isActive ? Math.round(totalTasks * executionRate) : 0;
            const unexecutedTasks = totalTasks - executedTasks;

            const plannedRatio = isActive ? 0.4 + rand() * 0.5 : 0;
            const planned = isActive ? Math.round(executedTasks * plannedRatio) : 0;
            const unplanned = executedTasks - planned;

            const dailyWorkHours = 8;
            const actualHours = isActive ? Math.round((tier.minHours + rand() * (tier.maxHours - tier.minHours)) * 10) / 10 : 0;
            const lostHours = isActive ? Math.round((dailyWorkHours - actualHours) * 10) / 10 : 0;

            const workPercentage = isActive ? Math.round((actualHours / dailyWorkHours) * 1000) / 1000 : 0;
            const executedWorkPercentage = isActive && totalTasks > 0
                ? Math.round((executedTasks / totalTasks) * 1000) / 1000
                : 0;
            const plannedWorkPercentage = isActive && executedTasks > 0
                ? Math.round((planned / executedTasks) * 1000) / 1000
                : 0;
            const unplannedWorkPercentage = isActive && executedTasks > 0
                ? Math.round((unplanned / executedTasks) * 1000) / 1000
                : 0;

            records.push({
                id: `rec-${String(recordId).padStart(4, "0")}`,
                employeeId: employee.id,
                employeeName: employee.name,
                departmentName: employee.subDepartmentName,
                subDepartmentId: employee.subDepartmentId,
                date,
                registrationStatus,
                attendanceDays: isActive ? 1 : 0,
                totalTasks,
                executedTasks,
                unexecutedTasks,
                planned,
                unplanned,
                dailyWorkHours: isActive ? dailyWorkHours : 0,
                actualHours,
                lostHours,
                workPercentage,
                executedWorkPercentage,
                plannedWorkPercentage,
                unplannedWorkPercentage,
            });

            recordId++;
        }
    }

    return records;
}

export const seedDepartmentRecords: DepartmentDailyRecordInterface[] = generateRecords();
