import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowUpDown,
    FolderKanban,
    Filter,
    Search,
    X,
    MapPin,
    Building2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { Header, ScoreGauge, ProgressBar, EmptyState } from "@/components/shared";
import { Badge, Button, Card, CardHeader, CardTitle, CardContent, Input } from "@/atoms";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/ui";
import { useDeferredLoad, usePageTitle } from "@/hooks";
import { routesData, getProjectDetailPath } from "@/data";
import { seedProjects, PROJECT_TYPE_META } from "@/data/seed";
import type { ProjectInterface, ProjectType } from "@/interfaces";

// ── Types ──────────────────────────────────────────────────────────────────

type PerformanceFilter = "all" | "excellent" | "good" | "average" | "weak";
type LevelFilter = "all" | "high" | "medium" | "low";
type TypeFilter = "all" | ProjectType;

// ── Filter labels ──────────────────────────────────────────────────────────

const PERF_FILTER_LABELS: Record<PerformanceFilter, string> = {
    all: "جميع مستويات الأداء",
    excellent: "ممتاز (٨٠%+)",
    good: "جيد (٦٠-٧٩%)",
    average: "متوسط (٤٥-٥٩%)",
    weak: "ضعيف (أقل من ٤٥%)",
};

const COST_FILTER_LABELS: Record<LevelFilter, string> = {
    all: "جميع مستويات التكلفة",
    high: "مرتفع (٨٠%+)",
    medium: "متوسط (٦٠-٧٩%)",
    low: "منخفض (أقل من ٦٠%)",
};

const TIME_FILTER_LABELS: Record<LevelFilter, string> = {
    all: "جميع مستويات الوقت",
    high: "مرتفع (٨٠%+)",
    medium: "متوسط (٦٠-٧٩%)",
    low: "منخفض (أقل من ٦٠%)",
};

const QUALITY_FILTER_LABELS: Record<LevelFilter, string> = {
    all: "جميع مستويات الجودة",
    high: "مرتفع (٨٠%+)",
    medium: "متوسط (٦٠-٧٩%)",
    low: "منخفض (أقل من ٦٠%)",
};

const TYPE_FILTER_LABELS: Record<TypeFilter, string> = {
    all: "جميع الأنواع",
    "villas-compound": PROJECT_TYPE_META["villas-compound"].typeLabel,
    "residential-tower": PROJECT_TYPE_META["residential-tower"].typeLabel,
    "houses": PROJECT_TYPE_META["houses"].typeLabel,
    "housing-compound": PROJECT_TYPE_META["housing-compound"].typeLabel,
    "school": PROJECT_TYPE_META["school"].typeLabel,
    "factory": PROJECT_TYPE_META["factory"].typeLabel,
    "mall": PROJECT_TYPE_META["mall"].typeLabel,
    "hospital": PROJECT_TYPE_META["hospital"].typeLabel,
};

const SORT_LABELS: Record<string, string> = {
    "avg:desc": "الأداء العام (الأعلى أولاً)",
    "avg:asc": "الأداء العام (الأقل أولاً)",
    "cost:desc": "التكلفة (الأعلى أولاً)",
    "cost:asc": "التكلفة (الأقل أولاً)",
    "time:desc": "الوقت (الأعلى أولاً)",
    "time:asc": "الوقت (الأقل أولاً)",
    "quality:desc": "الجودة (الأعلى أولاً)",
    "quality:asc": "الجودة (الأقل أولاً)",
};

const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];

// ── Helpers ────────────────────────────────────────────────────────────────

function matchesLevel(value: number, filter: LevelFilter): boolean {
    if (filter === "all") return true;
    if (filter === "high") return value >= 80;
    if (filter === "medium") return value >= 60 && value < 80;
    return value < 60; // low
}

function matchesPerformance(value: number, filter: PerformanceFilter): boolean {
    if (filter === "all") return true;
    if (filter === "excellent") return value >= 80;
    if (filter === "good") return value >= 60 && value < 80;
    if (filter === "average") return value >= 45 && value < 60;
    return value < 45; // weak
}

function getSortValue(project: ProjectInterface, key: string): number {
    if (key === "cost") return project.cost;
    if (key === "time") return project.time;
    if (key === "quality") return project.quality;
    return project.avgPerformance; // avg
}

// ── Component ──────────────────────────────────────────────────────────────

export function ProjectsView() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const isReady = useDeferredLoad(200);
    usePageTitle("إدارة المشروعات");

    // Read all state from URL
    const searchQuery = searchParams.get("q") || "";
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const searchDebounce = useRef<ReturnType<typeof setTimeout>>(undefined);
    const perfFilter = (searchParams.get("perf") || "all") as PerformanceFilter;
    const costFilter = (searchParams.get("cost") || "all") as LevelFilter;
    const timeFilter = (searchParams.get("time") || "all") as LevelFilter;
    const qualityFilter = (searchParams.get("quality") || "all") as LevelFilter;
    const typeFilter = (searchParams.get("type") || "all") as TypeFilter;
    const sortRaw = searchParams.get("sort") || "avg:desc";
    const currentPage = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("limit")) || 12;

    // Brief loading state on filter/sort/page changes
    const [isRefreshing, setIsRefreshing] = useState(false);
    const refreshTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const prevKey = useRef("");
    const changeKey = searchParams.toString();
    useEffect(() => {
        if (prevKey.current && prevKey.current !== changeKey) {
            queueMicrotask(() => setIsRefreshing(true));
            clearTimeout(refreshTimer.current);
            refreshTimer.current = setTimeout(() => setIsRefreshing(false), 300);
        }
        prevKey.current = changeKey;
        return () => clearTimeout(refreshTimer.current);
    }, [changeKey]);

    // Parse sort
    const [sortKey, sortDir] = useMemo(() => {
        const [k, d] = sortRaw.split(":");
        const validKeys = ["avg", "cost", "time", "quality"];
        const validDirs = ["asc", "desc"];
        return [
            validKeys.includes(k) ? k : "avg",
            validDirs.includes(d) ? d : "desc",
        ] as const;
    }, [sortRaw]);

    // Helper to update a single URL param (resets page on filter change)
    const setParam = useCallback(
        (key: string, value: string, resetPage = true) => {
            setSearchParams(
                (prev) => {
                    if (value === "" || value === "all") {
                        prev.delete(key);
                    } else {
                        prev.set(key, value);
                    }
                    if (resetPage && key !== "page") {
                        prev.set("page", "1");
                    }
                    return prev;
                },
                { replace: true },
            );
        },
        [setSearchParams],
    );

    const handleSearchChange = useCallback((value: string) => {
        setLocalSearch(value);
        clearTimeout(searchDebounce.current);
        searchDebounce.current = setTimeout(() => {
            setParam("q", value);
        }, 300);
    }, [setParam]);

    const setCurrentPage = (v: number) => setParam("page", String(v), false);
    const setPageSize = (v: number) => {
        setSearchParams(
            (prev) => {
                prev.set("limit", String(v));
                prev.set("page", "1");
                return prev;
            },
            { replace: true },
        );
    };

    // Filter projects
    const filteredProjects = useMemo(() => {
        const q = searchQuery.trim();
        return seedProjects.filter((p) => {
            if (q && !p.name.includes(q) && !p.location.includes(q)) return false;
            if (typeFilter !== "all" && p.type !== typeFilter) return false;
            if (!matchesPerformance(p.avgPerformance, perfFilter)) return false;
            if (!matchesLevel(p.cost, costFilter)) return false;
            if (!matchesLevel(p.time, timeFilter)) return false;
            if (!matchesLevel(p.quality, qualityFilter)) return false;
            return true;
        });
    }, [searchQuery, typeFilter, perfFilter, costFilter, timeFilter, qualityFilter]);

    // Sort projects
    const sortedProjects = useMemo(() => {
        const mul = sortDir === "asc" ? 1 : -1;
        return [...filteredProjects].sort(
            (a, b) => (getSortValue(a, sortKey) - getSortValue(b, sortKey)) * mul,
        );
    }, [filteredProjects, sortKey, sortDir]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedProjects.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedProjects = sortedProjects.slice(
        (safeCurrentPage - 1) * pageSize,
        safeCurrentPage * pageSize,
    );
    const startIndex = (safeCurrentPage - 1) * pageSize + 1;
    const endIndex = Math.min(safeCurrentPage * pageSize, sortedProjects.length);

    const hasActiveFilters =
        searchQuery ||
        typeFilter !== "all" ||
        perfFilter !== "all" ||
        costFilter !== "all" ||
        timeFilter !== "all" ||
        qualityFilter !== "all";

    const clearFilters = () => {
        setSearchParams(
            (prev) => {
                prev.delete("type");
                prev.delete("perf");
                prev.delete("cost");
                prev.delete("time");
                prev.delete("quality");
                prev.set("page", "1");
                return prev;
            },
            { replace: true },
        );
    };

    if (!isReady) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-48 rounded-lg bg-[var(--color-surface)] animate-pulse" />
                        <div className="h-4 w-72 rounded-lg bg-[var(--color-surface)] animate-pulse" />
                    </div>
                    <div className="h-10 w-24 rounded-xl bg-[var(--color-surface)] animate-pulse" />
                </div>
                <div className="h-12 w-full rounded-xl bg-[var(--color-surface)] animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-56 rounded-xl bg-[var(--color-surface)] animate-pulse"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <Header
                title="إدارة المشروعات"
                description="نظرة شاملة على أداء مشاريع الشركة"
                actions={
                    <Button
                        variant="outline"
                        onClick={() => navigate(routesData.dashboard)}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        العودة
                    </Button>
                }
            />

            {/* Filter Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 min-w-0">
                <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
                    <Filter className="h-4 w-4" />
                    <span>تصفية</span>
                </div>

                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                    <Input
                        placeholder="بحث بالاسم أو الموقع..."
                        value={localSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pr-9 h-9 text-sm"
                    />
                </div>

                {/* Type filter */}
                <Select
                    value={typeFilter}
                    onValueChange={(v) => setParam("type", v)}
                >
                    <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
                        <SelectValue placeholder="نوع المشروع" />
                    </SelectTrigger>
                    <SelectContent>
                        {(
                            Object.entries(TYPE_FILTER_LABELS) as [
                                TypeFilter,
                                string,
                            ][]
                        ).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Performance filter */}
                <Select
                    value={perfFilter}
                    onValueChange={(v) => setParam("perf", v)}
                >
                    <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
                        <SelectValue placeholder="مستوى الأداء" />
                    </SelectTrigger>
                    <SelectContent>
                        {(
                            Object.entries(PERF_FILTER_LABELS) as [
                                PerformanceFilter,
                                string,
                            ][]
                        ).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Cost filter */}
                <Select
                    value={costFilter}
                    onValueChange={(v) => setParam("cost", v)}
                >
                    <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
                        <SelectValue placeholder="مستوى التكلفة" />
                    </SelectTrigger>
                    <SelectContent>
                        {(
                            Object.entries(COST_FILTER_LABELS) as [
                                LevelFilter,
                                string,
                            ][]
                        ).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Time filter */}
                <Select
                    value={timeFilter}
                    onValueChange={(v) => setParam("time", v)}
                >
                    <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
                        <SelectValue placeholder="مستوى الوقت" />
                    </SelectTrigger>
                    <SelectContent>
                        {(
                            Object.entries(TIME_FILTER_LABELS) as [
                                LevelFilter,
                                string,
                            ][]
                        ).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Quality filter */}
                <Select
                    value={qualityFilter}
                    onValueChange={(v) => setParam("quality", v)}
                >
                    <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
                        <SelectValue placeholder="مستوى الجودة" />
                    </SelectTrigger>
                    <SelectContent>
                        {(
                            Object.entries(QUALITY_FILTER_LABELS) as [
                                LevelFilter,
                                string,
                            ][]
                        ).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
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
                        {sortedProjects.length} مشروع
                    </span>
                    {searchQuery && (
                        <Badge variant="secondary" className="gap-1">
                            بحث: {searchQuery}
                            <button onClick={() => { setParam("q", ""); setLocalSearch(""); }} className="cursor-pointer">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {typeFilter !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            النوع: {TYPE_FILTER_LABELS[typeFilter]}
                            <button onClick={() => setParam("type", "all")} className="cursor-pointer">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {perfFilter !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            الأداء: {PERF_FILTER_LABELS[perfFilter]}
                            <button onClick={() => setParam("perf", "all")} className="cursor-pointer">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {costFilter !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            التكلفة: {COST_FILTER_LABELS[costFilter]}
                            <button onClick={() => setParam("cost", "all")} className="cursor-pointer">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {timeFilter !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            الوقت: {TIME_FILTER_LABELS[timeFilter]}
                            <button onClick={() => setParam("time", "all")} className="cursor-pointer">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {qualityFilter !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            الجودة: {QUALITY_FILTER_LABELS[qualityFilter]}
                            <button onClick={() => setParam("quality", "all")} className="cursor-pointer">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                </div>
            )}

            {/* Sort section */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
                    <ArrowUpDown className="h-4 w-4" />
                    <span>ترتيب</span>
                </div>

                <Select value={sortRaw} onValueChange={(v) => setParam("sort", v, false)}>
                    <SelectTrigger className="w-full sm:w-[220px] h-9 text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(SORT_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {sortRaw !== "avg:desc" && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setParam("sort", "avg:desc", false)}
                        className="gap-1 text-[var(--color-error)] hover:text-[var(--color-error)]"
                    >
                        <X className="h-3.5 w-3.5" />
                        مسح
                    </Button>
                )}
            </div>

            {/* Results count */}
            {!hasActiveFilters && (
                <span className="text-sm text-[var(--color-text-muted)] mb-2 block">
                    {sortedProjects.length} مشروع
                </span>
            )}

            {/* Project Cards Grid — skeleton on refresh */}
            {isRefreshing ? (
                <div className="space-y-4 animate-pulse">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-48 rounded-xl bg-[var(--color-surface)]" />
                        ))}
                    </div>
                </div>
            ) : (
            <>
            {paginatedProjects.length === 0 ? (
                <EmptyState
                    icon={searchQuery ? Search : FolderKanban}
                    title={searchQuery ? "لا توجد نتائج بحث" : "لا توجد مشاريع مطابقة"}
                    description={searchQuery ? `لا توجد مشاريع تطابق "${searchQuery}". جرب البحث بكلمة أخرى.` : "جرب تغيير معايير التصفية لعرض المشاريع المتاحة."}
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {paginatedProjects.map((project) => (
                        <Card
                            key={project.id}
                            className="relative cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-[var(--color-primary)]/40 hover:shadow-md"
                            onClick={() => navigate(getProjectDetailPath(project.id))}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    {project.name}
                                </CardTitle>
                                <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                                    {project.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-[var(--color-text-secondary)]">
                                    <span className="inline-flex items-center gap-1">
                                        <Building2 className="h-3 w-3" />
                                        {PROJECT_TYPE_META[project.type].typeLabel}
                                    </span>
                                    <span className="text-[var(--color-border)]">•</span>
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {project.location}
                                    </span>
                                    <span className="text-[var(--color-border)]">•</span>
                                    <span className="tabular-nums">
                                        {project.unitCount} {project.unitType}
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Score Gauges */}
                                <div className="flex items-center justify-around">
                                    <ScoreGauge
                                        score={project.cost}
                                        size="sm"
                                        label="التكلفة"
                                    />
                                    <ScoreGauge
                                        score={project.time}
                                        size="sm"
                                        label="الوقت"
                                    />
                                    <ScoreGauge
                                        score={project.quality}
                                        size="sm"
                                        label="الجودة"
                                    />
                                </div>

                                {/* Overall Performance */}
                                <ProgressBar
                                    value={project.avgPerformance}
                                    label="الأداء العام"
                                    size="sm"
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {sortedProjects.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[var(--color-border)] pt-3">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                        <span>
                            عرض {startIndex} - {endIndex} من {sortedProjects.length}
                        </span>
                        <span className="text-[var(--color-border)]">|</span>
                        <div className="flex items-center gap-1.5">
                            <span>عناصر:</span>
                            <Select
                                value={String(pageSize)}
                                onValueChange={(v) => setPageSize(Number(v))}
                            >
                                <SelectTrigger className="w-[68px] h-8 text-xs cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <SelectItem
                                            key={size}
                                            value={String(size)}
                                        >
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
                            onClick={() =>
                                setCurrentPage(Math.max(1, safeCurrentPage - 1))
                            }
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
                            onClick={() =>
                                setCurrentPage(
                                    Math.min(totalPages, safeCurrentPage + 1),
                                )
                            }
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
            </>
            )}
        </div>
    );
}
