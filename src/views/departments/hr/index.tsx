import { useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, X, Loader2 } from "lucide-react";
import { Header, ProgressBar, DataTable, type SortState, type SortDirection } from "@/components/shared";
import { useDeferredLoad, usePageTitle } from "@/hooks";
import { Button, Input, Badge } from "@/atoms";
import { Tabs, TabsList, TabsTrigger, TabsContent, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/ui";
import { routesData, getEmployeeProfilePath, getEmployeeInsightsPath } from "@/data";
import { seedDepartmentRecords, seedSubDepartments, seedEmployees } from "@/data/seed";
import { getTenureInfo, TENURE_FILTER_LABELS, type TenureFilter } from "@/utils";
import type {
    EmployeeInterface,
    DepartmentDailyRecordInterface,
} from "@/interfaces";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

type PerformanceFilter = "all" | "excellent" | "good" | "average" | "weak";

// Calculate employee performance for the last 7 days (last week)
function calculateEmployeePerformance(
    employeeId: string,
    records: DepartmentDailyRecordInterface[]
): number {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoMs = weekAgo.getTime();

    const employeeRecords = records.filter(
        (r) => r.employeeId === employeeId && r.executedWorkPercentage > 0 && new Date(r.date).getTime() >= weekAgoMs
    );
    if (employeeRecords.length === 0) return 0;
    const avg =
        employeeRecords.reduce((s, r) => s + r.executedWorkPercentage, 0) /
        employeeRecords.length;
    return Math.round(avg * 100);
}

function getPerformanceCategory(perf: number): PerformanceFilter {
    if (perf >= 90) return "excellent";
    if (perf >= 75) return "good";
    if (perf >= 60) return "average";
    return "weak";
}

const PERF_FILTER_LABELS: Record<PerformanceFilter, string> = {
    all: "جميع مستويات الأداء",
    excellent: "ممتاز (٩٠%+)",
    good: "جيد (٧٥-٨٩%)",
    average: "متوسط (٦٠-٧٤%)",
    weak: "ضعيف (أقل من ٦٠%)",
};

interface FilteredTableProps {
    employees: EmployeeInterface[];
    records: DepartmentDailyRecordInterface[];
    navigate: ReturnType<typeof useNavigate>;
    deptLabel: string;
}

function FilteredTable({ employees, records, navigate, deptLabel }: FilteredTableProps) {
    const [searchParams, setSearchParams] = useSearchParams();

    // Read all filter/page/sort state from URL
    const searchQuery = searchParams.get("q") || "";
    const roleFilter = searchParams.get("role") || "all";
    const perfFilter = (searchParams.get("perf") || "all") as PerformanceFilter;
    const tenureFilter = (searchParams.get("tenure") || "all") as TenureFilter;
    const currentPage = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("limit")) || 10;

    // Parse sort state from URL: "name:asc,performance:desc"
    const sortState: SortState[] = useMemo(() => {
        const raw = searchParams.get("sort") || "";
        if (!raw) return [];
        return raw.split(",").map((s) => {
            const [key, dir] = s.split(":");
            return { key, direction: (dir || "asc") as SortDirection };
        }).filter((s) => s.key && s.direction);
    }, [searchParams]);

    // Helper to update a single URL param
    const setParam = useCallback((key: string, value: string, resetPage = true) => {
        setSearchParams((prev) => {
            if (value === "" || value === "all") {
                prev.delete(key);
            } else {
                prev.set(key, value);
            }
            if (resetPage && key !== "page") prev.set("page", "1");
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const setSearchQuery = (v: string) => setParam("q", v);
    const setRoleFilter = (v: string) => setParam("role", v);
    const setPerfFilter = (v: string) => setParam("perf", v);
    const setTenureFilter = (v: string) => setParam("tenure", v);
    const setCurrentPage = (v: number) => setParam("page", String(v), false);
    const setPageSize = (v: number) => {
        setSearchParams((prev) => { prev.set("limit", String(v)); prev.set("page", "1"); return prev; }, { replace: true });
    };

    // Get unique roles
    const uniqueRoles = useMemo(() => {
        const roles = new Set(employees.map((m) => m.role));
        return Array.from(roles).sort();
    }, [employees]);

    // Performance cache
    const performanceMap = useMemo(() => {
        const map = new Map<string, number>();
        employees.forEach((m) => {
            map.set(m.id, calculateEmployeePerformance(m.id, records));
        });
        return map;
    }, [employees, records]);

    // Filtered members
    const filteredEmployees = useMemo(() => {
        let result = employees;

        // Search by name
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            result = result.filter((m) => m.name.toLowerCase().includes(q));
        }

        // Filter by role
        if (roleFilter !== "all") {
            result = result.filter((m) => m.role === roleFilter);
        }

        // Filter by performance
        if (perfFilter !== "all") {
            result = result.filter((m) => {
                const perf = performanceMap.get(m.id) ?? 0;
                return getPerformanceCategory(perf) === perfFilter;
            });
        }

        // Filter by tenure
        if (tenureFilter !== "all") {
            result = result.filter((m) => {
                const t = getTenureInfo(m.joiningDate);
                if (tenureFilter === "new") return t.isNewJoiner;
                if (tenureFilter === "senior") return t.isSenior;
                return !t.isNewJoiner && !t.isSenior;
            });
        }

        return result;
    }, [employees, searchQuery, roleFilter, perfFilter, tenureFilter, performanceMap]);

    // Sort handler — persists to URL
    const handleSort = useCallback((key: string) => {
        setSearchParams((prev) => {
            const raw = prev.get("sort") || "";
            const parts = raw ? raw.split(",").map((s) => { const [k, d] = s.split(":"); return { key: k, dir: d }; }) : [];
            const existing = parts.find((s) => s.key === key);
            let newParts;
            if (!existing) {
                newParts = [...parts, { key, dir: "asc" }];
            } else if (existing.dir === "asc") {
                newParts = parts.map((s) => s.key === key ? { ...s, dir: "desc" } : s);
            } else {
                newParts = parts.filter((s) => s.key !== key);
            }
            if (newParts.length === 0) {
                prev.delete("sort");
            } else {
                prev.set("sort", newParts.map((s) => `${s.key}:${s.dir}`).join(","));
            }
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    // Apply sorting
    const sortedEmployees = useMemo(() => {
        if (sortState.length === 0) return filteredEmployees;
        return [...filteredEmployees].sort((a, b) => {
            for (const { key, direction } of sortState) {
                if (!direction) continue;
                const mul = direction === "asc" ? 1 : -1;
                if (key === "name") {
                    const cmp = a.name.localeCompare(b.name, "ar");
                    if (cmp !== 0) return cmp * mul;
                } else if (key === "performance") {
                    const pa = performanceMap.get(a.id) ?? 0;
                    const pb = performanceMap.get(b.id) ?? 0;
                    if (pa !== pb) return (pa - pb) * mul;
                }
            }
            return 0;
        });
    }, [filteredEmployees, sortState, performanceMap]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedEmployees = sortedEmployees.slice(
        (safeCurrentPage - 1) * pageSize,
        safeCurrentPage * pageSize
    );
    const startIndex = (safeCurrentPage - 1) * pageSize + 1;
    const endIndex = Math.min(safeCurrentPage * pageSize, sortedEmployees.length);

    // Department overall performance (always from ALL employees, not affected by filters)
    const deptPerformance =
        employees.length > 0
            ? Math.round(
                  employees.reduce(
                      (sum, m) => sum + (performanceMap.get(m.id) ?? 0),
                      0
                  ) / employees.length
              )
            : 0;

    const hasActiveFilters = searchQuery || roleFilter !== "all" || perfFilter !== "all" || tenureFilter !== "all";

    const clearFilters = () => {
        setSearchParams((prev) => {
            prev.delete("q");
            prev.delete("role");
            prev.delete("perf");
            prev.delete("tenure");
            prev.set("page", "1");
            return prev;
        }, { replace: true });
    };

    const columns = [
        {
            key: "name",
            header: "اسم الموظف",
            sortable: true,
            render: (m: EmployeeInterface) => {
                const t = getTenureInfo(m.joiningDate);
                const perf = performanceMap.get(m.id) ?? 0;
                return (
                    <span className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium hover:underline hover:text-[var(--color-primary)] transition-colors cursor-pointer">{m.name}</span>
                        {t.isNewJoiner && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 animate-pulse whitespace-nowrap">جديد</span>
                        )}
                        {t.isSenior && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/15 text-amber-400 badge-shimmer whitespace-nowrap">قديم</span>
                        )}
                        {perf >= 90 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-yellow-500/15 text-yellow-400 badge-star whitespace-nowrap">متفوق</span>
                        )}
                        {perf > 0 && perf < 50 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-red-500/15 text-red-400 badge-low whitespace-nowrap">منخفض</span>
                        )}
                    </span>
                );
            },
        },
        {
            key: "role",
            header: "الدور",
            render: (m: EmployeeInterface) => (
                <span className="text-[var(--color-text-muted)]">
                    {m.role}
                </span>
            ),
        },
        {
            key: "department",
            header: "القسم",
            render: (m: EmployeeInterface) => (
                <span className="text-[var(--color-text-muted)] text-xs">
                    {m.subDepartmentName}
                </span>
            ),
            className: "hidden sm:table-cell",
        },
        {
            key: "performance",
            header: "أداء الأسبوع",
            sortable: true,
            render: (m: EmployeeInterface) => {
                const perf = performanceMap.get(m.id) ?? 0;
                return (
                    <ProgressBar
                        value={perf}
                        size="sm"
                        showPercentage={true}
                        label=""
                        className="min-w-[120px]"
                    />
                );
            },
        },
        {
            key: "actions",
            header: "تفاصيل",
            render: (m: EmployeeInterface) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(getEmployeeInsightsPath(m.id));
                    }}
                    className="gap-1"
                >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">تحليلات الأداء</span>
                </Button>
            ),
            className: "w-20",
        },
    ];

    return (
        <div className="space-y-4">
            {/* Performance bar */}
            <ProgressBar
                value={deptPerformance}
                label={deptLabel}
                size="lg"
            />

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 min-w-0">
                <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
                    <Filter className="h-4 w-4" />
                    <span>تصفية</span>
                </div>

                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                    <Input
                        placeholder="بحث بالاسم..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                        }}
                        className="pr-9 h-9 text-sm"
                    />
                </div>

                {/* Role filter */}
                <Select
                    value={roleFilter}
                    onValueChange={(v) => {
                        setRoleFilter(v);
                    }}
                >
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                        <SelectValue placeholder="الدور الوظيفي" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">جميع الأدوار</SelectItem>
                        {uniqueRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                                {role}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Performance filter */}
                <Select
                    value={perfFilter}
                    onValueChange={(v) => {
                        setPerfFilter(v as PerformanceFilter);
                    }}
                >
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                        <SelectValue placeholder="مستوى الأداء" />
                    </SelectTrigger>
                    <SelectContent>
                        {(Object.entries(PERF_FILTER_LABELS) as [PerformanceFilter, string][]).map(
                            ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                    {label}
                                </SelectItem>
                            )
                        )}
                    </SelectContent>
                </Select>

                {/* Tenure filter */}
                <Select
                    value={tenureFilter}
                    onValueChange={(v) => {
                        setTenureFilter(v as TenureFilter);
                    }}
                >
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                        <SelectValue placeholder="مدة الخدمة" />
                    </SelectTrigger>
                    <SelectContent>
                        {(Object.entries(TENURE_FILTER_LABELS) as [TenureFilter, string][]).map(
                            ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                    {label}
                                </SelectItem>
                            )
                        )}
                    </SelectContent>
                </Select>

                {/* Clear filters */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="gap-1 text-[var(--color-error)] hover:text-[var(--color-error)]"
                    >
                        <X className="h-3.5 w-3.5" />
                        مسح
                    </Button>
                )}
            </div>

            {/* Active filter badges */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[var(--color-text-muted)]">
                        {filteredEmployees.length} نتيجة
                    </span>
                    {searchQuery && (
                        <Badge variant="secondary" className="gap-1">
                            بحث: {searchQuery}
                            <button onClick={() => { setSearchQuery(""); }} className="cursor-pointer">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {roleFilter !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            الدور: {roleFilter}
                            <button onClick={() => { setRoleFilter("all"); }} className="cursor-pointer">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {perfFilter !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            الأداء: {PERF_FILTER_LABELS[perfFilter]}
                            <button onClick={() => { setPerfFilter("all"); }} className="cursor-pointer">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {tenureFilter !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            مدة الخدمة: {TENURE_FILTER_LABELS[tenureFilter]}
                            <button onClick={() => { setTenureFilter("all"); }} className="cursor-pointer">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                </div>
            )}

            {/* Table */}
            <DataTable
                columns={columns}
                data={paginatedEmployees}
                onRowClick={(m) => navigate(getEmployeeProfilePath(m.id))}
                emptyMessage="لا توجد نتائج مطابقة للتصفية"
                sortState={sortState}
                onSort={handleSort}
            />

            {/* Pagination */}
            {filteredEmployees.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[var(--color-border)] pt-3">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                        <span>
                            عرض {startIndex} - {endIndex} من {filteredEmployees.length}
                        </span>
                        <span className="text-[var(--color-border)]">|</span>
                        <div className="flex items-center gap-1.5">
                            <span>صفوف:</span>
                            <Select
                                value={String(pageSize)}
                                onValueChange={(v) => {
                                    setPageSize(Number(v));
                                }}
                            >
                                <SelectTrigger className="w-[68px] h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <SelectItem key={size} value={String(size)}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={safeCurrentPage <= 1}
                            onClick={() => setCurrentPage(1)}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={safeCurrentPage <= 1}
                            onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        <span className="px-3 text-sm font-medium text-[var(--color-text-secondary)] tabular-nums">
                            {safeCurrentPage} / {totalPages}
                        </span>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={safeCurrentPage >= totalPages}
                            onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={safeCurrentPage >= totalPages}
                            onClick={() => setCurrentPage(totalPages)}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-48 rounded-lg bg-[var(--color-surface)] animate-pulse" />
                    <div className="h-4 w-72 rounded-lg bg-[var(--color-surface)] animate-pulse" />
                </div>
                <div className="h-10 w-24 rounded-xl bg-[var(--color-surface)] animate-pulse" />
            </div>
            <div className="h-10 w-full rounded-xl bg-[var(--color-surface)] animate-pulse" />
            <div className="h-6 w-full rounded-full bg-[var(--color-surface)] animate-pulse" />
            <div className="h-12 w-full rounded-xl bg-[var(--color-surface)] animate-pulse" />
            <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="h-10 flex-1 rounded-lg bg-[var(--color-surface)] animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-center gap-3 pt-4">
                <Loader2 className="h-5 w-5 text-[var(--color-primary)] animate-spin" />
                <span className="text-sm text-[var(--color-text-muted)]">جاري تحميل بيانات الموظفين...</span>
            </div>
        </div>
    );
}

export function HrPerformanceView() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const isReady = useDeferredLoad(200);
    usePageTitle("تقييم وإدارة الأداء");

    const tab = searchParams.get("tab") || "all";
    const handleTabChange = useCallback(
        (value: string) => {
            setSearchParams((prev) => {
                prev.set("tab", value);
                // Reset filters that are department-specific
                prev.delete("page");
                prev.delete("limit");
                prev.delete("role");
                prev.delete("q");
                prev.delete("perf");
                prev.delete("tenure");
                prev.delete("sort");
                return prev;
            }, { replace: true });
        },
        [setSearchParams]
    );

    const employees = seedEmployees;
    const records = seedDepartmentRecords;
    const subDepartments = seedSubDepartments;

    const getEmployees = (subDeptId?: string) => {
        if (!subDeptId) return employees;
        return employees.filter((m) => m.subDepartmentId === subDeptId);
    };

    if (!isReady) return <LoadingSkeleton />;

    return (
        <div className="space-y-6 animate-fade-in">
            <Header
                title="تقييم وإدارة الأداء"
                description={`متابعة وتقييم أداء ${employees.length} موظف عبر ${subDepartments.length} أقسام داخلية`}
                actions={
                    <Button
                        variant="outline"
                        onClick={() => navigate(routesData.departmentHr)}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        العودة
                    </Button>
                }
            />

            <Tabs value={tab} onValueChange={handleTabChange} dir="rtl">
                <TabsList>
                    <TabsTrigger value="all">
                        الكل ({employees.length})
                    </TabsTrigger>
                    {subDepartments.map((sd) => (
                        <TabsTrigger key={sd.id} value={sd.id}>
                            {sd.name} ({getEmployees(sd.id).length})
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="all">
                    <FilteredTable
                        employees={getEmployees()}
                        records={records}
                        navigate={navigate}
                        deptLabel="الأداء العام لجميع الأقسام"
                    />
                </TabsContent>

                {subDepartments.map((sd) => (
                    <TabsContent key={sd.id} value={sd.id}>
                        <FilteredTable
                            employees={getEmployees(sd.id)}
                            records={records}
                            navigate={navigate}
                            deptLabel={`أداء قسم ${sd.name}`}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
