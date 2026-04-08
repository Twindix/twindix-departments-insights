import { useNavigate } from "react-router-dom";
import { Users, TrendingUp, Building2, Award, Lock, LockOpen } from "lucide-react";
import { toast } from "sonner";
import { Header, DepartmentCircle, StatCard, DashboardSkeleton } from "@/components/shared";
import { useDeferredLoad, usePageTitle } from "@/hooks";
import { routesData } from "@/data";
import { seedDepartments } from "@/data/seed";
import type { DepartmentInterface } from "@/interfaces";

export function DashboardView() {
    const navigate = useNavigate();
    const isReady = useDeferredLoad(200);
    usePageTitle();
    const departments = seedDepartments;

    if (!isReady) return <DashboardSkeleton />;

    const totalEmployees = departments.reduce(
        (sum, d) => sum + d.employeeCount,
        0
    );
    // Average of all 9 department card percentages
    const avgPerformance = departments.length > 0
        ? Math.round(departments.reduce((sum, d) => sum + d.overallPerformance, 0) / departments.length)
        : 0;

    const departmentRoutes: Record<string, string> = {
        "dept-hr": routesData.departmentHr,
        "dept-projects": routesData.departmentProjects,
        "dept-finance": routesData.departmentFinance,
    };

    const handleDepartmentClick = (dept: DepartmentInterface) => {
        if (dept.isAccessible && departmentRoutes[dept.id]) {
            navigate(departmentRoutes[dept.id]);
        } else {
            toast.error("ليس لديك تصريح للاطلاع على هذه المعلومات", {
                description: `الوصول إلى ${dept.name} مقيّد. تواصل مع المسؤول للحصول على صلاحية.`,
                duration: 4000,
            });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <Header
                title="لوحة تحليلات الأقسام"
                description="نظرة شاملة على أداء جميع أقسام الشركة ومؤشراتها"
            />

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="إجمالي الأقسام"
                    value={departments.length}
                    icon={Building2}
                    color="#6366F1"
                />
                <StatCard
                    label="إجمالي الموظفين"
                    value={totalEmployees}
                    icon={Users}
                    color="#10B981"
                />
                <StatCard
                    label="متوسط الأداء"
                    value={avgPerformance}
                    suffix="%"
                    icon={TrendingUp}
                    color="#2563EB"
                />
                <StatCard
                    label="أعلى أداء"
                    value={departments.length > 0 ? Math.max(...departments.map((d) => d.overallPerformance)) : 0}
                    suffix="%"
                    icon={Award}
                    color="#F59E0B"
                />
            </div>

            {/* Department Circles */}
            <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-dark)] mb-4">
                    أقسام الشركة
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 stagger-children">
                    {departments.map((dept) => (
                        <DepartmentCircle
                            key={dept.id}
                            name={dept.name}
                            performance={dept.overallPerformance}
                            color={dept.color}
                            isAccessible={dept.isAccessible}
                            employeeCount={dept.employeeCount}
                            onClick={() => handleDepartmentClick(dept)}
                        />
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-[var(--color-success)] flex items-center justify-center">
                        <LockOpen className="h-3 w-3 text-white" />
                    </div>
                    <span>متاح للعرض</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 rounded-full bg-[var(--color-surface-active)] border border-[var(--color-border)] flex items-center justify-center">
                        <Lock className="h-2.5 w-2.5 text-[var(--color-text-muted)]" />
                    </div>
                    <span>يتطلب صلاحية</span>
                </div>
            </div>
        </div>
    );
}
