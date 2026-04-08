import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    ClipboardList,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    Eye,
    CalendarDays,
    User,
    Briefcase,
    GraduationCap,
    Award,
    BookOpen,
    Phone,
    Mail,
    MapPin,
    Hash,
    Heart,
    Shield,
    Baby,
    Sparkles,
} from "lucide-react";
import { Header, StatCard, ProgressBar, DatePicker, EmployeeProfileSkeleton } from "@/components/shared";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/atoms";
import { useSettings, useDeferredLoad, usePageTitle } from "@/hooks";
import { getEmployeeInsightsPath } from "@/data";
import { seedDepartmentRecords, seedEmployees, seedEmployeeCvs } from "@/data/seed";
import { getTenureInfo } from "@/utils";

interface ChartPoint {
    x: number;
    y: number;
    date: string;
    value: number;
}

function TrendChart({
    points,
    formatDate,
    viewMode,
}: {
    points: ChartPoint[];
    formatDate: (d: string, f?: "short" | "long" | "iso") => string;
    viewMode: ViewMode;
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Percentages for layout (CSS-based, not SVG viewBox)
    const chartLeft = 6;   // % from right for Y-axis labels
    const chartBottom = 14; // % from bottom for X-axis labels

    // Map points to percentage positions within the chart area
    const mapped = points.map((p) => ({
        ...p,
        pctX: chartLeft + (p.x / 100) * (100 - chartLeft),
        pctY: (p.y / 100) * (100 - chartBottom),
    }));

    // SVG polyline in a viewBox that matches the chart area
    const svgW = 100 - chartLeft;
    const svgH = 100 - chartBottom;

    const svgPoints = points.map((p) => ({
        sx: (p.x / 100) * svgW,
        sy: (p.y / 100) * svgH,
    }));

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const overlay = overlayRef.current;
            if (!overlay || points.length === 0) return;

            const rect = overlay.getBoundingClientRect();
            // In RTL, the chart area starts from the right side
            // The overlay covers the chart drawing area (left:0 to right:chartLeft+2%)
            // Mouse position as percentage from the RIGHT edge (RTL)
            const xFromRight = ((rect.right - e.clientX) / rect.width) * 100;

            // Find nearest point by comparing mapped pctX (which is from right)
            // But our overlay only covers the chart area, so we need to map
            // xFromRight (0-100 of overlay) to the point's x (0-100 range)
            // The overlay width corresponds to (100 - chartLeft)% of the container
            // Points' x values go 0-100 within that same range
            const xPct = (xFromRight / 100) * 100; // percentage within the overlay = point x

            let nearest = 0;
            let minDist = Infinity;
            for (let i = 0; i < points.length; i++) {
                const dist = Math.abs(points[i].x - xPct);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = i;
                }
            }
            setHoveredIndex(nearest);
        },
        [points, chartLeft]
    );

    const handleMouseLeave = useCallback(() => {
        setHoveredIndex(null);
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">
                    اتجاه الأداء عبر الزمن
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    className="relative w-full select-none"
                    style={{ height: 280 }}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Y-axis labels (HTML) */}
                    {[0, 25, 50, 75, 100].map((val) => {
                        const topPct = ((100 - val) / 100) * (100 - chartBottom);
                        return (
                            <div
                                key={val}
                                className="absolute text-xs font-medium text-[var(--color-text-muted)] tabular-nums"
                                style={{
                                    top: `${topPct}%`,
                                    right: 0,
                                    transform: "translateY(-50%)",
                                    width: `${chartLeft}%`,
                                    textAlign: "center",
                                }}
                            >
                                %{val}
                            </div>
                        );
                    })}

                    {/* Grid lines (HTML divs for crisp rendering) */}
                    {[0, 25, 50, 75, 100].map((val) => {
                        const topPct = ((100 - val) / 100) * (100 - chartBottom);
                        return (
                            <div
                                key={`grid-${val}`}
                                className="absolute border-t border-dashed border-[var(--color-border)]"
                                style={{
                                    top: `${topPct}%`,
                                    left: 0,
                                    right: `${chartLeft + 1}%`,
                                }}
                            />
                        );
                    })}

                    {/* X-axis labels (HTML) */}
                    {mapped.map((p, i) => {
                        const showLabel = mapped.length <= 7 || i % 2 === 0 || i === mapped.length - 1;
                        if (!showLabel) return null;
                        let label: string;
                        if (viewMode === "daily") {
                            const d = new Date(p.date);
                            label = `${d.getDate()}/${d.getMonth() + 1}`;
                        } else {
                            label = formatGroupKey(p.date, viewMode);
                        }
                        return (
                            <div
                                key={`x-${i}`}
                                className="absolute text-[10px] font-medium text-[var(--color-text-muted)] tabular-nums whitespace-nowrap"
                                style={{
                                    bottom: 0,
                                    right: `${p.pctX - 1.5}%`,
                                    height: `${chartBottom - 2}%`,
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                {label}
                            </div>
                        );
                    })}

                    {/* SVG chart area (line + area) */}
                    <svg
                        viewBox={`0 0 ${svgW} ${svgH}`}
                        className="absolute"
                        style={{
                            top: 0,
                            left: 0,
                            width: `${100 - chartLeft}%`,
                            height: `${100 - chartBottom}%`,
                        }}
                        preserveAspectRatio="none"
                    >
                        {/* Area fill */}
                        <polygon
                            points={`${svgPoints.map((p) => `${p.sx},${p.sy}`).join(" ")} ${svgPoints[svgPoints.length - 1].sx},${svgH} ${svgPoints[0].sx},${svgH}`}
                            fill="var(--color-primary)"
                            fillOpacity="0.08"
                        />
                        {/* Line */}
                        <polyline
                            points={svgPoints.map((p) => `${p.sx},${p.sy}`).join(" ")}
                            fill="none"
                            stroke="var(--color-primary)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                            className="chart-line-reveal"
                        />
                    </svg>

                    {/* Vertical hover line (HTML for correct RTL positioning) */}
                    {hoveredIndex !== null && (
                        <div
                            className="absolute border-r border-dashed border-[var(--color-primary)] opacity-40 pointer-events-none"
                            style={{
                                right: `${mapped[hoveredIndex].pctX}%`,
                                top: 0,
                                height: `${100 - chartBottom}%`,
                                zIndex: 3,
                            }}
                        />
                    )}

                    {/* Transparent overlay for hover-anywhere detection */}
                    <div
                        ref={overlayRef}
                        className="absolute cursor-crosshair"
                        style={{
                            top: 0,
                            left: 0,
                            width: `${100 - chartLeft}%`,
                            height: `${100 - chartBottom}%`,
                            zIndex: 4,
                        }}
                        onMouseMove={handleMouseMove}
                    />

                    {/* Dots as HTML (so they don't get distorted) */}
                    {mapped.map((p, i) => (
                        <div
                            key={`dot-${i}`}
                            className="absolute pointer-events-none"
                            style={{
                                right: `${p.pctX}%`,
                                top: `${p.pctY}%`,
                                transform: "translate(50%, -50%)",
                                zIndex: hoveredIndex === i ? 5 : 2,
                            }}
                        >
                            {/* Pulse ring */}
                            {hoveredIndex === i && (
                                <div
                                    className="absolute rounded-full bg-[var(--color-primary)] opacity-15"
                                    style={{ inset: -6 }}
                                />
                            )}
                            {/* Dot */}
                            <div
                                className="rounded-full transition-all duration-150"
                                style={{
                                    width: hoveredIndex === i ? 12 : 8,
                                    height: hoveredIndex === i ? 12 : 8,
                                    margin: hoveredIndex === i ? 0 : 2,
                                    backgroundColor: hoveredIndex === i ? "var(--color-bg)" : "var(--color-primary)",
                                    border: `2px solid var(--color-primary)`,
                                    opacity: 0,
                                    animation: `fade-in 0.3s ease-out ${0.5 + i * 0.1}s forwards`,
                                }}
                            />
                        </div>
                    ))}

                    {/* Tooltip */}
                    {hoveredIndex !== null && (
                        <div
                            className="absolute pointer-events-none z-10"
                            style={{
                                right: `${mapped[hoveredIndex].pctX}%`,
                                top: `${mapped[hoveredIndex].pctY}%`,
                                transform: "translate(50%, -100%) translateY(-14px)",
                            }}
                        >
                            <div className="rounded-lg bg-[var(--color-text-dark)] text-[var(--color-bg)] px-3 py-2 shadow-lg text-center whitespace-nowrap animate-scale-in">
                                <p className="text-sm font-bold tabular-nums">
                                    {points[hoveredIndex].value}%
                                </p>
                                <p className="text-xs opacity-75 mt-0.5">
                                    {formatDate(points[hoveredIndex].date)}
                                </p>
                            </div>
                            <div className="mx-auto w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[var(--color-text-dark)]" />
                        </div>
                    )}

                    <style>{`
                        .chart-line-reveal {
                            clip-path: inset(0 100% 0 0);
                            animation: reveal-line 1.5s ease-out forwards;
                        }
                        @keyframes reveal-line {
                            to { clip-path: inset(0 0 0 0); }
                        }
                    `}</style>
                </div>
            </CardContent>
        </Card>
    );
}

type DatePreset = "7d" | "15d" | "1m" | "3m" | "6m" | "1y" | "3y" | "custom";

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
    { value: "7d", label: "آخر أسبوع" },
    { value: "15d", label: "آخر ١٥ يوم" },
    { value: "1m", label: "آخر شهر" },
    { value: "3m", label: "آخر ٣ أشهر" },
    { value: "6m", label: "آخر ٦ أشهر" },
    { value: "1y", label: "آخر سنة" },
    { value: "3y", label: "آخر ٣ سنوات" },
    { value: "custom", label: "مخصص" },
];

function getPresetStartDate(preset: DatePreset, lastDate: string): string {
    const end = new Date(lastDate);
    switch (preset) {
        case "7d": { const d = new Date(end); d.setDate(d.getDate() - 7); return d.toISOString().split("T")[0]; }
        case "15d": { const d = new Date(end); d.setDate(d.getDate() - 15); return d.toISOString().split("T")[0]; }
        case "1m": { const d = new Date(end); d.setMonth(d.getMonth() - 1); return d.toISOString().split("T")[0]; }
        case "3m": { const d = new Date(end); d.setMonth(d.getMonth() - 3); return d.toISOString().split("T")[0]; }
        case "6m": { const d = new Date(end); d.setMonth(d.getMonth() - 6); return d.toISOString().split("T")[0]; }
        case "1y": { const d = new Date(end); d.setFullYear(d.getFullYear() - 1); return d.toISOString().split("T")[0]; }
        case "3y": { const d = new Date(end); d.setFullYear(d.getFullYear() - 3); return d.toISOString().split("T")[0]; }
        default: return lastDate;
    }
}

// Max 3 years back for custom
function getMinCustomDate(lastDate: string): string {
    const d = new Date(lastDate);
    d.setFullYear(d.getFullYear() - 3);
    return d.toISOString().split("T")[0];
}

const CARDS_PER_PAGE = 6;

type ViewMode = "daily" | "weekly" | "monthly" | "yearly";
const VIEW_MODE_LABELS: Record<ViewMode, string> = {
    daily: "يومي",
    weekly: "أسبوعي",
    monthly: "شهري",
    yearly: "سنوي",
};

// Determine which view modes are available based on the date range span
function getAvailableViewModes(startDate: string, endDate: string): ViewMode[] {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const days = (end - start) / (1000 * 60 * 60 * 24);
    const modes: ViewMode[] = ["daily"];
    if (days > 14) modes.push("weekly");
    if (days > 60) modes.push("monthly");
    if (days > 365) modes.push("yearly");
    return modes;
}

// Group dates by the selected view mode and return group keys
function groupDatesByMode(dates: string[], mode: ViewMode): Map<string, string[]> {
    const groups = new Map<string, string[]>();
    for (const date of dates) {
        const d = new Date(date);
        let key: string;
        switch (mode) {
            case "weekly": {
                const weekStart = new Date(d);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                key = weekStart.toISOString().split("T")[0];
                break;
            }
            case "monthly":
                key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                break;
            case "yearly":
                key = `${d.getFullYear()}`;
                break;
            default:
                key = date;
        }
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(date);
    }
    return groups;
}

function formatGroupKey(key: string, mode: ViewMode): string {
    switch (mode) {
        case "weekly": {
            const d = new Date(key);
            const end = new Date(d);
            end.setDate(end.getDate() + 6);
            return `${d.getDate()}/${d.getMonth() + 1} — ${end.getDate()}/${end.getMonth() + 1}`;
        }
        case "monthly": {
            const [y, m] = key.split("-");
            const d = new Date(Number(y), Number(m) - 1);
            return d.toLocaleDateString("ar-EG", { year: "numeric", month: "long" });
        }
        case "yearly":
            return key;
        default:
            return key; // daily — formatted by caller using formatDate
    }
}

interface DepartmentDailyRecordAggregated {
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
    registrationStatus: string;
    count: number;
}

function aggregateRecords(records: { totalTasks: number; executedTasks: number; unexecutedTasks: number; planned: number; unplanned: number; dailyWorkHours: number; actualHours: number; lostHours: number; workPercentage: number; executedWorkPercentage: number; registrationStatus: string }[]): DepartmentDailyRecordAggregated {
    const active = records.filter((r) => r.totalTasks > 0);
    return {
        totalTasks: records.reduce((s, r) => s + r.totalTasks, 0),
        executedTasks: records.reduce((s, r) => s + r.executedTasks, 0),
        unexecutedTasks: records.reduce((s, r) => s + r.unexecutedTasks, 0),
        planned: records.reduce((s, r) => s + r.planned, 0),
        unplanned: records.reduce((s, r) => s + r.unplanned, 0),
        dailyWorkHours: records.reduce((s, r) => s + r.dailyWorkHours, 0),
        actualHours: Math.round(records.reduce((s, r) => s + r.actualHours, 0) * 10) / 10,
        lostHours: Math.round(records.reduce((s, r) => s + Math.max(0, r.lostHours), 0) * 10) / 10,
        workPercentage: active.length > 0 ? active.reduce((s, r) => s + r.workPercentage, 0) / active.length : 0,
        executedWorkPercentage: active.length > 0 ? active.reduce((s, r) => s + r.executedWorkPercentage, 0) / active.length : 0,
        registrationStatus: records.every((r) => r.registrationStatus === "تم") ? "تم" : records.every((r) => r.registrationStatus === "أجازة") ? "أجازة" : records.some((r) => r.registrationStatus === "تم") ? "تم" : "لم يتم",
        count: records.length,
    };
}

function ViewModeSelector({ mode, onChange, availableModes }: { mode: ViewMode; onChange: (m: ViewMode) => void; availableModes: ViewMode[] }) {
    if (availableModes.length <= 1) return null;
    return (
        <div className="flex items-center gap-1.5">
            {availableModes.map((m) => (
                <button
                    key={m}
                    onClick={() => onChange(m)}
                    className={`px-3 py-1.5 text-xs rounded-md cursor-pointer transition-colors ${
                        mode === m
                            ? "bg-[var(--color-primary)] text-white"
                            : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                >
                    {VIEW_MODE_LABELS[m]}
                </button>
            ))}
        </div>
    );
}

export function EmployeeProfileView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { formatDate } = useSettings();
    const isReady = useDeferredLoad(150);
    usePageTitle("ملف الموظف");

    const employees = seedEmployees;
    const allRecords = seedDepartmentRecords;
    const employee = employees.find((m) => m.id === id);
    const cv = seedEmployeeCvs.find((c) => c.employeeId === id);
    const records = useMemo(
        () =>
            allRecords
                .filter((r) => r.employeeId === id)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        [allRecords, id]
    );

    const allUniqueDates = useMemo(
        () => [...new Set(records.map((r) => r.date))].sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
        [records]
    );

    const lastDate = allUniqueDates[allUniqueDates.length - 1] ?? new Date().toISOString().split("T")[0];

    // Last-7-days performance — used for badges (stable, not affected by date filter)
    const lastWeekPerformance = useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoMs = weekAgo.getTime();
        const active = records.filter((r) => r.executedWorkPercentage > 0 && new Date(r.date).getTime() >= weekAgoMs);
        if (active.length === 0) return 0;
        return Math.round((active.reduce((s, r) => s + r.executedWorkPercentage, 0) / active.length) * 100);
    }, [records]);

    // Date range state — persisted in URL search params
    const urlPreset = (searchParams.get("preset") || "7d") as DatePreset;
    const urlFrom = searchParams.get("from");
    const urlTo = searchParams.get("to");

    const initStart = urlPreset === "custom" && urlFrom ? urlFrom : getPresetStartDate(urlPreset, lastDate);
    const initEnd = urlPreset === "custom" && urlTo ? urlTo : lastDate;

    const [preset, setPresetRaw] = useState<DatePreset>(urlPreset);
    const [startDate, setStartDateRaw] = useState<string>(initStart);
    const [endDate, setEndDateRaw] = useState<string>(initEnd);


    const syncUrl = useCallback((p: DatePreset, from: string, to: string) => {
        setSearchParams((prev) => {
            prev.set("preset", p);
            if (p === "custom") {
                prev.set("from", from);
                prev.set("to", to);
            } else {
                prev.delete("from");
                prev.delete("to");
            }
            // Reset all section pages when date range changes
            prev.delete("tp");
            prev.delete("hp");
            prev.delete("cp");
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const handlePreset = useCallback(
        (p: DatePreset) => {
            setPresetRaw(p);
            if (p !== "custom") {
                const newStart = getPresetStartDate(p, lastDate);
                setStartDateRaw(newStart);
                setEndDateRaw(lastDate);
                syncUrl(p, newStart, lastDate);
            } else {
                syncUrl(p, startDate, endDate);
            }
        },
        [lastDate, syncUrl, startDate, endDate]
    );

    const handleStartDate = useCallback((val: string) => {
        setStartDateRaw(val);
        setPresetRaw("custom");
        syncUrl("custom", val, endDate);
    }, [syncUrl, endDate]);

    const handleEndDate = useCallback((val: string) => {
        setEndDateRaw(val);
        setPresetRaw("custom");
        syncUrl("custom", startDate, val);
    }, [syncUrl, startDate]);

    const isCustom = preset === "custom";
    const minCustom = getMinCustomDate(lastDate);

    // Brief loading state on duration changes
    const [isRefreshing, setIsRefreshing] = useState(false);
    const refreshTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const prevDateKey = useRef("");
    const dateKey = `${startDate}-${endDate}`;
    useEffect(() => {
        if (prevDateKey.current && prevDateKey.current !== dateKey) {
            queueMicrotask(() => setIsRefreshing(true));
            clearTimeout(refreshTimer.current);
            refreshTimer.current = setTimeout(() => setIsRefreshing(false), 400);
        }
        prevDateKey.current = dateKey;
        return () => clearTimeout(refreshTimer.current);
    }, [dateKey]);

    // Helper to read/write URL params for section state
    const getParam = (key: string, fallback: string) => searchParams.get(key) || fallback;
    const setParams = useCallback((updates: Record<string, string>) => {
        setSearchParams((prev) => {
            for (const [key, value] of Object.entries(updates)) {
                if (value === "" || value === "0") {
                    prev.delete(key);
                } else {
                    prev.set(key, value);
                }
            }
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    // Section pages — persisted in URL
    const tasksPage = Number(getParam("tp", "1"));
    const setTasksPage = (v: number | ((p: number) => number)) => {
        const val = typeof v === "function" ? v(tasksPage) : v;
        setParams({ tp: String(val) });
    };
    const hoursPage = Number(getParam("hp", "1"));
    const setHoursPage = (v: number | ((p: number) => number)) => {
        const val = typeof v === "function" ? v(hoursPage) : v;
        setParams({ hp: String(val) });
    };
    const cardsPageVal = Number(getParam("cp", "1"));
    const setCardsPageVal = (v: number | ((p: number) => number)) => {
        const val = typeof v === "function" ? v(cardsPageVal) : v;
        setParams({ cp: String(val) });
    };

    // Section view modes — persisted in URL
    const chartViewMode = (getParam("chartMode", "daily")) as ViewMode;
    const setChartViewMode = (m: ViewMode) => setParams({ chartMode: m });
    const tasksViewMode = (getParam("tasksMode", "daily")) as ViewMode;
    const hoursViewMode = (getParam("hoursMode", "daily")) as ViewMode;
    const cardsViewMode = (getParam("cardsMode", "daily")) as ViewMode;

    const SECTION_PAGE_SIZE = 10;

    // Filtered records based on date range
    const filteredRecords = useMemo(() => {
        if (!startDate || !endDate) return records;
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        return records.filter((r) => {
            const d = new Date(r.date).getTime();
            return d >= start && d <= end;
        });
    }, [records, startDate, endDate]);

    // Unique dates from filtered records
    const uniqueDates = useMemo(
        () => [...new Set(filteredRecords.map((r) => r.date))].sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
        [filteredRecords]
    );

    // Computed stats from filtered records
    const filteredAvgPerformance = useMemo(() => {
        const active = filteredRecords.filter((r) => r.executedWorkPercentage > 0);
        if (active.length === 0) return 0;
        return Math.round((active.reduce((s, r) => s + r.executedWorkPercentage, 0) / active.length) * 100);
    }, [filteredRecords]);

    const totalTasks = useMemo(
        () => filteredRecords.reduce((s, r) => s + r.totalTasks, 0),
        [filteredRecords]
    );

    const totalExecuted = useMemo(
        () => filteredRecords.reduce((s, r) => s + r.executedTasks, 0),
        [filteredRecords]
    );

    const totalUnexecuted = useMemo(
        () => filteredRecords.reduce((s, r) => s + r.unexecutedTasks, 0),
        [filteredRecords]
    );

    const totalLostHours = useMemo(
        () => filteredRecords.reduce((s, r) => s + Math.max(0, r.lostHours), 0),
        [filteredRecords]
    );



    // Chart points from filtered active records
    // Available view modes based on selected date range
    const availableViewModes = useMemo(
        () => getAvailableViewModes(startDate, endDate),
        [startDate, endDate]
    );

    // Grouped data for each section
    const groupedForChart = useMemo(() => {
        const groups = groupDatesByMode(uniqueDates, chartViewMode);
        const points: ChartPoint[] = [];
        const entries = Array.from(groups.entries());
        entries.forEach(([key, dates]) => {
            const recs = dates.flatMap((dt) => filteredRecords.filter((r) => r.date === dt && r.totalTasks > 0));
            if (recs.length === 0) return;
            const avg = recs.reduce((s, r) => s + r.executedWorkPercentage, 0) / recs.length;
            points.push({
                x: 0, // will be re-normalized below
                y: 100 - avg * 100,
                date: chartViewMode === "daily" ? dates[0] : key,
                value: Math.round(avg * 100),
            });
        });
        // Re-normalize x positions to ensure points span 0-100 evenly
        points.forEach((p, idx) => {
            p.x = (idx / Math.max(points.length - 1, 1)) * 100;
        });
        return points;
    }, [uniqueDates, chartViewMode, filteredRecords]);

    const chartPoints = groupedForChart;

    const groupedForTasks = useMemo(() => {
        const groups = groupDatesByMode(uniqueDates, tasksViewMode);
        return Array.from(groups.entries()).map(([key, dates]) => {
            const recs = dates.flatMap((dt) => filteredRecords.filter((r) => r.date === dt));
            const agg = aggregateRecords(recs);
            return { key, label: tasksViewMode === "daily" ? dates[0] : key, agg };
        });
    }, [uniqueDates, tasksViewMode, filteredRecords]);

    const groupedForHours = useMemo(() => {
        const groups = groupDatesByMode(uniqueDates, hoursViewMode);
        return Array.from(groups.entries()).map(([key, dates]) => {
            const recs = dates.flatMap((dt) => filteredRecords.filter((r) => r.date === dt));
            const agg = aggregateRecords(recs);
            return { key, label: hoursViewMode === "daily" ? dates[0] : key, agg };
        }).filter(({ agg }) => agg.dailyWorkHours > 0);
    }, [uniqueDates, hoursViewMode, filteredRecords]);

    const groupedForCards = useMemo(() => {
        const groups = groupDatesByMode(uniqueDates, cardsViewMode);
        return Array.from(groups.entries()).map(([key, dates]) => {
            const recs = dates.flatMap((dt) => filteredRecords.filter((r) => r.date === dt));
            const agg = aggregateRecords(recs);
            return { key, label: cardsViewMode === "daily" ? dates[0] : key, agg };
        });
    }, [uniqueDates, cardsViewMode, filteredRecords]);

    if (!isReady) return <EmployeeProfileSkeleton />;

    if (!employee) {
        return (
            <div className="flex items-center justify-center py-20 text-[var(--color-text-muted)]">
                لم يتم العثور على الموظف
            </div>
        );
    }

    const tenure = getTenureInfo(employee.joiningDate);

    return (
        <div className="space-y-6 animate-fade-in">
            <Header
                title={
                    <span className="flex items-center gap-2 flex-wrap">
                        {`ملف الموظف - ${employee.name}`}
                        {tenure.isNewJoiner && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 animate-pulse">
                                موظف جديد
                            </span>
                        )}
                        {tenure.isSenior && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 badge-shimmer">
                                موظف قديم
                            </span>
                        )}
                        {lastWeekPerformance >= 90 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-500/15 text-yellow-400 badge-star">
                                موظف متفوق
                            </span>
                        )}
                        {lastWeekPerformance > 0 && lastWeekPerformance < 50 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-400 badge-low">
                                أداء منخفض
                            </span>
                        )}
                    </span>
                }
                description={`${employee.role} | ${employee.subDepartmentName} | تاريخ الانضمام: ${formatDate(employee.joiningDate)} (${tenure.label})`}
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() =>
                                navigate(getEmployeeInsightsPath(employee.id), { state: { from: "profile" } })
                            }
                            className="gap-2"
                        >
                            <Eye className="h-4 w-4" />
                            تحليلات الأداء
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            العودة
                        </Button>
                    </div>
                }
            />

            {/* Date Range Filter */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 space-y-3">
                {/* Presets row */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1">
                    <CalendarDays className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                    <span className="text-sm font-medium text-[var(--color-text-secondary)] shrink-0">الفترة</span>
                    <div className="flex items-center gap-1.5">
                        {DATE_PRESETS.map((p) => (
                            <Button
                                key={p.value}
                                variant={preset === p.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePreset(p.value)}
                                className="text-[11px] shrink-0 h-7 px-2"
                            >
                                {p.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Date inputs row */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <DatePicker
                        label="من"
                        value={startDate}
                        min={minCustom}
                        max={endDate}
                        onChange={handleStartDate}
                        disabled={!isCustom}
                    />
                    <span className="text-[var(--color-text-muted)] hidden sm:block pb-2">—</span>
                    <DatePicker
                        label="إلى"
                        value={endDate}
                        min={startDate}
                        max={lastDate}
                        onChange={handleEndDate}
                        disabled={!isCustom}
                    />
                    {isCustom && (
                        <span className="text-[10px] text-[var(--color-text-muted)] shrink-0 pb-2">
                            (أقصى حد: ٣ سنوات)
                        </span>
                    )}
                </div>
            </div>

            {/* Data section — shows skeleton during duration changes */}
            {isRefreshing ? (
                <div className="space-y-4 animate-pulse">
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-24 rounded-xl bg-[var(--color-surface)]" />
                        ))}
                    </div>
                    <div className="h-72 rounded-xl bg-[var(--color-surface)]" />
                    <div className="h-48 rounded-xl bg-[var(--color-surface)]" />
                </div>
            ) : (
            <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                <StatCard
                    label="إجمالي المهام"
                    value={totalTasks}
                    icon={ClipboardList}
                    color="#6366F1"
                />
                <StatCard
                    label="المهام المنفذة"
                    value={totalExecuted}
                    icon={CheckCircle2}
                    color="#10B981"
                />
                <StatCard
                    label="المهام الغير منفذة"
                    value={totalUnexecuted}
                    icon={XCircle}
                    color="#EF4444"
                />
                <StatCard
                    label="ساعات مفقودة"
                    value={totalLostHours}
                    icon={Clock}
                    color="#F59E0B"
                />
                <StatCard
                    label="متوسط الأداء"
                    value={filteredAvgPerformance}
                    suffix="%"
                    icon={TrendingUp}
                    className="col-span-2 sm:col-span-1"
                    color="#2563EB"
                />
            </div>

            {/* Performance Trend Chart */}
            {chartPoints.length > 1 && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span />
                        <ViewModeSelector mode={chartViewMode} onChange={(m) => setChartViewMode(m)} availableModes={availableViewModes} />
                    </div>
                    <TrendChart
                        points={chartPoints}
                        formatDate={(d) => chartViewMode === "daily" ? formatDate(d) : formatGroupKey(d, chartViewMode)}
                        viewMode={chartViewMode}
                    />
                </div>
            )}

            {/* Tasks Bar Chart — Grouped & Paginated */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">تفصيل المهام</CardTitle>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-[var(--color-text-muted)]">{groupedForTasks.length} فترة</span>
                            <ViewModeSelector mode={tasksViewMode} onChange={(m) => { setParams({ tasksMode: m, tp: "1" }); }} availableModes={availableViewModes} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {groupedForTasks
                            .slice((tasksPage - 1) * SECTION_PAGE_SIZE, tasksPage * SECTION_PAGE_SIZE)
                            .map(({ key, label, agg }) => {
                            const total = agg.totalTasks || 1;
                            const execPct = (agg.executedTasks / total) * 100;
                            const unexecPct = (agg.unexecutedTasks / total) * 100;
                            return (
                                <div key={key} className="flex items-center gap-3">
                                    <span className="w-28 text-xs text-[var(--color-text-muted)] shrink-0 truncate" title={tasksViewMode === "daily" ? formatDate(label) : formatGroupKey(label, tasksViewMode)}>
                                        {tasksViewMode === "daily" ? formatDate(label) : formatGroupKey(label, tasksViewMode)}
                                    </span>
                                    <div className="flex-1 flex h-5 rounded-full overflow-hidden bg-[var(--color-surface)]">
                                        <div className="h-full bg-[var(--color-success)] transition-all duration-1000" style={{ width: `${execPct}%` }} title={`منفذة: ${agg.executedTasks}`} />
                                        <div className="h-full bg-[var(--color-error)] transition-all duration-1000" style={{ width: `${unexecPct}%` }} title={`غير منفذة: ${agg.unexecutedTasks}`} />
                                    </div>
                                    <Badge variant={agg.registrationStatus === "تم" ? "success" : agg.registrationStatus === "أجازة" ? "warning" : "secondary"} className="text-[10px] w-14 justify-center shrink-0">
                                        {agg.registrationStatus || "-"}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                            <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" /><span>منفذة</span></div>
                            <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-[var(--color-error)]" /><span>غير منفذة</span></div>
                        </div>
                        {groupedForTasks.length > SECTION_PAGE_SIZE && (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled={tasksPage <= 1} onClick={() => setTasksPage((p) => p - 1)}>السابق</Button>
                                <span className="text-xs text-[var(--color-text-muted)] tabular-nums">{tasksPage} / {Math.ceil(groupedForTasks.length / SECTION_PAGE_SIZE)}</span>
                                <Button variant="outline" size="sm" disabled={tasksPage >= Math.ceil(groupedForTasks.length / SECTION_PAGE_SIZE)} onClick={() => setTasksPage((p) => p + 1)}>التالي</Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Hours Comparison — Grouped & Paginated */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">مقارنة ساعات العمل</CardTitle>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-[var(--color-text-muted)]">{groupedForHours.length} فترة</span>
                            <ViewModeSelector mode={hoursViewMode} onChange={(m) => { setParams({ hoursMode: m, hp: "1" }); }} availableModes={availableViewModes} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {groupedForHours
                            .slice((hoursPage - 1) * SECTION_PAGE_SIZE, hoursPage * SECTION_PAGE_SIZE)
                            .map(({ key, label, agg }) => (
                                <div key={key} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[var(--color-text-muted)]">
                                            {hoursViewMode === "daily" ? formatDate(label) : formatGroupKey(label, hoursViewMode)}
                                        </span>
                                        <span className="text-[var(--color-text-secondary)] tabular-nums">
                                            {agg.actualHours}/{agg.dailyWorkHours} ساعة
                                        </span>
                                    </div>
                                    <div className="flex h-3 rounded-full overflow-hidden bg-[var(--color-surface)]">
                                        <div className="h-full bg-[var(--color-info)] rounded-full transition-all duration-1000" style={{ width: `${(agg.actualHours / agg.dailyWorkHours) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                    </div>
                    {groupedForHours.length > SECTION_PAGE_SIZE && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <Button variant="outline" size="sm" disabled={hoursPage <= 1} onClick={() => setHoursPage((p) => p - 1)}>السابق</Button>
                            <span className="text-xs text-[var(--color-text-muted)] tabular-nums">{hoursPage} / {Math.ceil(groupedForHours.length / SECTION_PAGE_SIZE)}</span>
                            <Button variant="outline" size="sm" disabled={hoursPage >= Math.ceil(groupedForHours.length / SECTION_PAGE_SIZE)} onClick={() => setHoursPage((p) => p + 1)}>التالي</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detailed Cards — Grouped & Paginated */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[var(--color-text-dark)] flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        البيانات التفصيلية
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-[var(--color-text-muted)]">{groupedForCards.length} فترة</span>
                        <ViewModeSelector mode={cardsViewMode} onChange={(m) => { setParams({ cardsMode: m, cp: "1" }); }} availableModes={availableViewModes} />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {groupedForCards
                        .slice((cardsPageVal - 1) * CARDS_PER_PAGE, cardsPageVal * CARDS_PER_PAGE)
                        .map(({ key, label, agg }) => (
                            <Card key={key} className="hover-lift">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm">
                                            {cardsViewMode === "daily" ? formatDate(label, "long") : formatGroupKey(label, cardsViewMode)}
                                        </CardTitle>
                                        <div className="flex items-center gap-1.5">
                                            {agg.count > 1 && <span className="text-[10px] text-[var(--color-text-muted)]">{agg.count} أيام</span>}
                                            <Badge variant={agg.registrationStatus === "تم" ? "success" : agg.registrationStatus === "أجازة" ? "warning" : "secondary"}>
                                                {agg.registrationStatus || "غير محدد"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><span className="text-[var(--color-text-muted)]">المهام:</span> <span className="font-medium">{agg.totalTasks}</span></div>
                                        <div><span className="text-[var(--color-text-muted)]">منفذة:</span> <span className="font-medium text-[var(--color-success)]">{agg.executedTasks}</span></div>
                                        <div><span className="text-[var(--color-text-muted)]">مخطط:</span> <span className="font-medium">{agg.planned}</span></div>
                                        <div><span className="text-[var(--color-text-muted)]">غير مخطط:</span> <span className="font-medium">{agg.unplanned}</span></div>
                                        <div><span className="text-[var(--color-text-muted)]">ساعات فعلية:</span> <span className="font-medium">{agg.actualHours}</span></div>
                                        <div><span className="text-[var(--color-text-muted)]">ساعات مفقودة:</span> <span className="font-medium text-[var(--color-error)]">{agg.lostHours}</span></div>
                                    </div>
                                    {agg.workPercentage > 0 && (
                                        <ProgressBar value={Math.round(agg.workPercentage * 100)} label="نسبة الأعمال" size="sm" className="mt-3" />
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                </div>

                {groupedForCards.length > CARDS_PER_PAGE && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <Button variant="outline" size="sm" disabled={cardsPageVal <= 1} onClick={() => setCardsPageVal((p) => p - 1)}>السابق</Button>
                        <span className="text-sm text-[var(--color-text-muted)] tabular-nums px-2">{cardsPageVal} / {Math.ceil(groupedForCards.length / CARDS_PER_PAGE)}</span>
                        <Button variant="outline" size="sm" disabled={cardsPageVal >= Math.ceil(groupedForCards.length / CARDS_PER_PAGE)} onClick={() => setCardsPageVal((p) => p + 1)}>التالي</Button>
                    </div>
                )}
            </div>

            </>
            )}

            {/* ── Employee CV / Resume Section ── */}
            {cv && (
                <div>
                    <h2 className="text-lg font-semibold text-[var(--color-text-dark)] flex items-center gap-2 mb-4">
                        <User className="h-5 w-5" />
                        السيرة الذاتية
                    </h2>

                    {/* Personal Info Grid */}
                    <Card className="mb-4">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Hash className="h-4 w-4 text-[var(--color-primary)]" />
                                البيانات الشخصية
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                                    <span className="text-[var(--color-text-muted)]">الجنس:</span>
                                    <span className="font-medium">{cv.gender}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CalendarDays className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                                    <span className="text-[var(--color-text-muted)]">تاريخ الميلاد:</span>
                                    <span className="font-medium">{formatDate(cv.birthDate)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Hash className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                                    <span className="text-[var(--color-text-muted)]">الرقم القومي:</span>
                                    <span className="font-medium tabular-nums">{cv.nationalId}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Heart className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                                    <span className="text-[var(--color-text-muted)]">الحالة الاجتماعية:</span>
                                    <span className="font-medium">{cv.maritalStatus}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Baby className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                                    <span className="text-[var(--color-text-muted)]">عدد الأبناء:</span>
                                    <span className="font-medium">{cv.childrenCount}</span>
                                </div>
                                {cv.militaryStatus !== "-" && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Shield className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                                        <span className="text-[var(--color-text-muted)]">الموقف من التجنيد:</span>
                                        <span className="font-medium">{cv.militaryStatus}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                                    <span className="text-[var(--color-text-muted)]">الهاتف:</span>
                                    <span className="font-medium tabular-nums" dir="ltr">{cv.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                                    <span className="text-[var(--color-text-muted)]">البريد:</span>
                                    <span className="font-medium text-xs truncate" dir="ltr">{employee.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                                    <span className="text-[var(--color-text-muted)]">العنوان:</span>
                                    <span className="font-medium">{cv.address}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Education */}
                    <Card className="mb-4">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-[var(--color-primary)]" />
                                التعليم
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                                    <GraduationCap className="h-5 w-5 text-[var(--color-primary)]" />
                                </div>
                                <div>
                                    <p className="font-semibold text-[var(--color-text-dark)]">{cv.education}</p>
                                    <p className="text-sm text-[var(--color-text-muted)]">{cv.university}</p>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">تخرج {cv.graduationYear}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills */}
                    {cv.skills.length > 0 && (
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                                    المهارات
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {cv.skills.map((skill, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs px-3 py-1">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Work Experience */}
                    {cv.experiences.length > 0 && (
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-[var(--color-primary)]" />
                                    الخبرات العملية
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative space-y-6">
                                    {/* Timeline line */}
                                    <div className="absolute top-2 right-[19px] bottom-2 w-px bg-[var(--color-border)]" />
                                    {cv.experiences.map((exp, i) => (
                                        <div key={i} className="flex gap-4 relative">
                                            <div className="h-10 w-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shrink-0 z-10">
                                                <Briefcase className="h-4 w-4 text-[var(--color-text-muted)]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between flex-wrap gap-1">
                                                    <p className="font-semibold text-[var(--color-text-dark)]">{exp.role}</p>
                                                    <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
                                                        {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : "حتى الآن"}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[var(--color-primary)] font-medium">{exp.company}</p>
                                                <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">{exp.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Certifications */}
                    {cv.certifications.length > 0 && (
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Award className="h-4 w-4 text-[var(--color-primary)]" />
                                    الشهادات المهنية
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {cv.certifications.map((cert, i) => (
                                        <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] p-3 bg-[var(--color-surface)]/50">
                                            <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                                <Award className="h-4 w-4 text-amber-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm text-[var(--color-text-dark)] truncate">{cert.name}</p>
                                                <p className="text-xs text-[var(--color-text-muted)]">{cert.issuer}</p>
                                                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{formatDate(cert.date)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Courses */}
                    {cv.courses.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-[var(--color-primary)]" />
                                    الدورات التدريبية
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {cv.courses.map((course, i) => (
                                        <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] p-3 bg-[var(--color-surface)]/50">
                                            <div className="h-9 w-9 rounded-lg bg-[var(--color-info)]/10 flex items-center justify-center shrink-0">
                                                <BookOpen className="h-4 w-4 text-[var(--color-info)]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm text-[var(--color-text-dark)] truncate">{course.name}</p>
                                                <p className="text-xs text-[var(--color-text-muted)]">{course.provider}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-[var(--color-text-muted)]">{formatDate(course.date)}</span>
                                                    <span className="text-xs text-[var(--color-text-muted)]">•</span>
                                                    <span className="text-xs text-[var(--color-text-muted)]">{course.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

        </div>
    );
}
