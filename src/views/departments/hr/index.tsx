import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, X, Loader2 } from "lucide-react";
import { Header, ProgressBar, DataTable } from "@/components/shared";
import { useDeferredLoad } from "@/hooks";
import { Button, Input, Badge } from "@/atoms";
import { Tabs, TabsList, TabsTrigger, TabsContent, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/ui";
import { routesData, getMemberProfilePath, getMemberInsightsPath } from "@/data";
import { seedDepartmentRecords, seedSubDepartments, seedMembers } from "@/data/seed";
import type {
    MemberInterface,
    DepartmentDailyRecordInterface,
} from "@/interfaces";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

type PerformanceFilter = "all" | "excellent" | "good" | "average" | "weak";

function calculateMemberPerformance(
    memberId: string,
    records: DepartmentDailyRecordInterface[]
): number {
    const memberRecords = records.filter(
        (r) => r.memberId === memberId && r.executedWorkPercentage > 0
    );
    if (memberRecords.length === 0) return 65;
    const avg =
        memberRecords.reduce((s, r) => s + r.executedWorkPercentage, 0) /
        memberRecords.length;
    return Math.round(avg * 100);
}

function getPerformanceCategory(perf: number): PerformanceFilter {
    if (perf >= 90) return "excellent";
    if (perf >= 75) return "good";
    if (perf >= 60) return "average";
    return "weak";
}

const PERF_FILTER_LABELS: Record<PerformanceFilter, string> = {
    all: "جميع المستويات",
    excellent: "ممتاز (٩٠%+)",
    good: "جيد (٧٥-٨٩%)",
    average: "متوسط (٦٠-٧٤%)",
    weak: "ضعيف (أقل من ٦٠%)",
};

interface FilteredTableProps {
    members: MemberInterface[];
    records: DepartmentDailyRecordInterface[];
    navigate: ReturnType<typeof useNavigate>;
    deptLabel: string;
}

function FilteredTable({ members, records, navigate, deptLabel }: FilteredTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [perfFilter, setPerfFilter] = useState<PerformanceFilter>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Get unique roles
    const uniqueRoles = useMemo(() => {
        const roles = new Set(members.map((m) => m.role));
        return Array.from(roles).sort();
    }, [members]);

    // Performance cache
    const performanceMap = useMemo(() => {
        const map = new Map<string, number>();
        members.forEach((m) => {
            map.set(m.id, calculateMemberPerformance(m.id, records));
        });
        return map;
    }, [members, records]);

    // Filtered members
    const filteredMembers = useMemo(() => {
        let result = members;

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

        return result;
    }, [members, searchQuery, roleFilter, perfFilter, performanceMap]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedMembers = filteredMembers.slice(
        (safeCurrentPage - 1) * pageSize,
        safeCurrentPage * pageSize
    );
    const startIndex = (safeCurrentPage - 1) * pageSize + 1;
    const endIndex = Math.min(safeCurrentPage * pageSize, filteredMembers.length);

    // Reset page when filters change
    const handleFilterChange = () => setCurrentPage(1);

    // Department overall performance (always from ALL members, not affected by filters)
    const deptPerformance =
        members.length > 0
            ? Math.round(
                  members.reduce(
                      (sum, m) => sum + (performanceMap.get(m.id) ?? 0),
                      0
                  ) / members.length
              )
            : 0;

    const hasActiveFilters = searchQuery || roleFilter !== "all" || perfFilter !== "all";

    const clearFilters = () => {
        setSearchQuery("");
        setRoleFilter("all");
        setPerfFilter("all");
        setCurrentPage(1);
    };

    const columns = [
        {
            key: "name",
            header: "اسم الموظف",
            render: (m: MemberInterface) => (
                <span className="font-medium hover:underline hover:text-[var(--color-primary)] transition-colors cursor-pointer">{m.name}</span>
            ),
        },
        {
            key: "role",
            header: "الدور",
            render: (m: MemberInterface) => (
                <span className="text-[var(--color-text-muted)]">
                    {m.role}
                </span>
            ),
        },
        {
            key: "department",
            header: "القسم",
            render: (m: MemberInterface) => (
                <span className="text-[var(--color-text-muted)] text-xs">
                    {m.subDepartmentName}
                </span>
            ),
            className: "hidden sm:table-cell",
        },
        {
            key: "performance",
            header: "الأداء",
            render: (m: MemberInterface) => {
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
            render: (m: MemberInterface) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(getMemberInsightsPath(m.id));
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
                            handleFilterChange();
                        }}
                        className="pr-9 h-9 text-sm"
                    />
                </div>

                {/* Role filter */}
                <Select
                    value={roleFilter}
                    onValueChange={(v) => {
                        setRoleFilter(v);
                        handleFilterChange();
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
                        handleFilterChange();
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
                        {filteredMembers.length} نتيجة
                    </span>
                    {searchQuery && (
                        <Badge variant="secondary" className="gap-1">
                            بحث: {searchQuery}
                            <button onClick={() => { setSearchQuery(""); handleFilterChange(); }} className="cursor-pointer">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {roleFilter !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            الدور: {roleFilter}
                            <button onClick={() => { setRoleFilter("all"); handleFilterChange(); }} className="cursor-pointer">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {perfFilter !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            الأداء: {PERF_FILTER_LABELS[perfFilter]}
                            <button onClick={() => { setPerfFilter("all"); handleFilterChange(); }} className="cursor-pointer">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                </div>
            )}

            {/* Table */}
            <DataTable
                columns={columns}
                data={paginatedMembers}
                onRowClick={(m) => navigate(getMemberProfilePath(m.id))}
                emptyMessage="لا توجد نتائج مطابقة للتصفية"
            />

            {/* Pagination */}
            {filteredMembers.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[var(--color-border)] pt-3">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                        <span>
                            عرض {startIndex} - {endIndex} من {filteredMembers.length}
                        </span>
                        <span className="text-[var(--color-border)]">|</span>
                        <div className="flex items-center gap-1.5">
                            <span>صفوف:</span>
                            <Select
                                value={String(pageSize)}
                                onValueChange={(v) => {
                                    setPageSize(Number(v));
                                    setCurrentPage(1);
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
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

export function HrDepartmentView() {
    const navigate = useNavigate();
    const isReady = useDeferredLoad(200);

    const members = seedMembers;
    const records = seedDepartmentRecords;
    const subDepartments = seedSubDepartments;

    const getMembers = (subDeptId?: string) => {
        if (!subDeptId) return members;
        return members.filter((m) => m.subDepartmentId === subDeptId);
    };

    if (!isReady) return <LoadingSkeleton />;

    return (
        <div className="space-y-6 animate-fade-in">
            <Header
                title="إدارة الموارد البشرية"
                description={`عرض تفصيلي لأداء ${members.length} موظف عبر ${subDepartments.length} أقسام داخلية`}
                actions={
                    <Button
                        variant="outline"
                        onClick={() => navigate(routesData.dashboard)}
                        className="gap-2"
                    >
                        <ArrowRight className="h-4 w-4" />
                        العودة
                    </Button>
                }
            />

            <Tabs defaultValue="all" dir="rtl">
                <TabsList>
                    <TabsTrigger value="all">
                        الكل ({members.length})
                    </TabsTrigger>
                    {subDepartments.map((sd) => (
                        <TabsTrigger key={sd.id} value={sd.id}>
                            {sd.name} ({getMembers(sd.id).length})
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="all">
                    <FilteredTable
                        members={getMembers()}
                        records={records}
                        navigate={navigate}
                        deptLabel="الأداء العام لجميع الأقسام"
                    />
                </TabsContent>

                {subDepartments.map((sd) => (
                    <TabsContent key={sd.id} value={sd.id}>
                        <FilteredTable
                            members={getMembers(sd.id)}
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
