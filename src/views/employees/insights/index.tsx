import { useCallback, useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft, Target, Award, BarChart3, FileText, BookOpen, Star } from "lucide-react";
import { Header, ScoreGauge, ProgressBar, EmployeeInsightsSkeleton } from "@/components/shared";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/atoms";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui";
import { useDeferredLoad, usePageTitle } from "@/hooks";
import { getEmployeeProfilePath } from "@/data";
import { seedEmployees, seedEmployeeInsights, SHARED_CORE_COMPETENCIES } from "@/data/seed";
import { getTenureInfo } from "@/utils";

export function EmployeeInsightsView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const isReady = useDeferredLoad(150);
    usePageTitle("تحليلات الأداء");

    const tab = searchParams.get("tab") || "intro";
    const handleTabChange = useCallback(
        (value: string) => {
            setSearchParams((prev) => { prev.set("tab", value); return prev; }, { replace: true });
        },
        [setSearchParams],
    );

    // Brief loading skeleton on tab change
    const [isTabLoading, setIsTabLoading] = useState(false);
    const tabTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const prevTab = useRef(tab);
    useEffect(() => {
        if (prevTab.current !== tab) {
            queueMicrotask(() => setIsTabLoading(true));
            clearTimeout(tabTimer.current);
            tabTimer.current = setTimeout(() => setIsTabLoading(false), 300);
        }
        prevTab.current = tab;
        return () => clearTimeout(tabTimer.current);
    }, [tab]);

    // The original list URL we came from (preserved through profile → insights)
    const fromList = (location.state as { from?: string } | null)?.from;

    if (!isReady) return <EmployeeInsightsSkeleton />;

    const employees = seedEmployees;
    const allInsights = seedEmployeeInsights;

    const employee = employees.find((m) => m.id === id);
    const rawInsights = allInsights.find((i) => i.employeeId === id);

    if (!employee || !rawInsights) {
        return (
            <div className="flex items-center justify-center py-20 text-[var(--color-text-muted)]">
                لم يتم العثور على بيانات التحليلات
            </div>
        );
    }

    // Merge shared descriptions into the employee's competencies
    const insights = {
        ...rawInsights,
        competencies: rawInsights.competencies.map((comp, i) => ({
            ...comp,
            levels: comp.levels.map((l, li) => ({
                ...l,
                description: l.description || SHARED_CORE_COMPETENCIES[i]?.levels[li]?.description || "",
            })),
        })),
        coreCompetencies: rawInsights.coreCompetencies.length > 0
            ? rawInsights.coreCompetencies
            : SHARED_CORE_COMPETENCIES,
    };

    const { overallPerformance } = insights;
    const tenure = getTenureInfo(employee.joiningDate);

    return (
        <div className="space-y-6 animate-fade-in">
            <Header
                title={
                    <span className="flex items-center gap-2 flex-wrap">
                        {`تحليلات الأداء - ${employee.name}`}
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
                        {overallPerformance.totalPercentage >= 90 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-500/15 text-yellow-400 badge-star">
                                موظف متفوق
                            </span>
                        )}
                        {overallPerformance.totalPercentage < 50 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-400 badge-low">
                                أداء منخفض
                            </span>
                        )}
                    </span>
                }
                description={`${employee.role} | ${employee.subDepartmentName} | ${insights.evaluationPeriod}`}
                actions={
                    <div className="flex items-center gap-2">
                        {id && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    navigate(getEmployeeProfilePath(id), {
                                        state: fromList ? { from: fromList } : undefined,
                                    })
                                }
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                العودة لملف الموظف
                            </Button>
                        )}
                    </div>
                }
            />

            <Tabs value={tab} onValueChange={handleTabChange} dir="rtl">
                <TabsList>
                    <TabsTrigger value="intro" className="gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        مقدمة
                    </TabsTrigger>
                    <TabsTrigger value="objectives" className="gap-1">
                        <Target className="h-3.5 w-3.5" />
                        الأهداف
                    </TabsTrigger>
                    <TabsTrigger value="competencies" className="gap-1">
                        <Award className="h-3.5 w-3.5" />
                        الجدارات
                    </TabsTrigger>
                    <TabsTrigger value="overall" className="gap-1">
                        <BarChart3 className="h-3.5 w-3.5" />
                        نتيجة الأداء
                    </TabsTrigger>
                    <TabsTrigger value="evidence" className="gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        الأدلة
                    </TabsTrigger>
                    <TabsTrigger value="core" className="gap-1">
                        <Star className="h-3.5 w-3.5" />
                        الجدارات الأساسية
                    </TabsTrigger>
                </TabsList>

                {isTabLoading ? (
                    <div className="space-y-4 animate-pulse mt-4">
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="h-48 rounded-xl bg-[var(--color-surface)]" />
                            <div className="h-48 rounded-xl bg-[var(--color-surface)] md:col-span-2" />
                        </div>
                    </div>
                ) : (
                <>
                {/* Introduction Tab */}
                <TabsContent value="intro">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>نظام تقييم الأداء</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                                    {insights.introduction}
                                </p>
                                <div className="mt-4 text-sm text-[var(--color-text-muted)]">
                                    <p>القسم: {insights.department}</p>
                                    <p>فترة التقييم: {insights.evaluationPeriod}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="flex flex-col items-center justify-center p-6">
                            <ScoreGauge
                                score={overallPerformance.totalPercentage}
                                size="lg"
                                label="التقييم العام"
                            />
                            <Badge
                                variant={
                                    overallPerformance.totalPercentage >= 80
                                        ? "success"
                                        : overallPerformance.totalPercentage >= 60
                                        ? "warning"
                                        : "destructive"
                                }
                                className="mt-3"
                            >
                                {overallPerformance.rating}
                            </Badge>
                        </Card>
                    </div>
                </TabsContent>

                {/* Objectives Tab */}
                <TabsContent value="objectives">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                الأداء الفني - المرتبط بالأهداف (70%)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                                            <th className="px-3 py-2 text-right">م</th>
                                            <th className="px-3 py-2 text-right">مؤشر الأداء</th>
                                            <th className="px-3 py-2 text-right hidden md:table-cell">معادلة القياس</th>
                                            <th className="px-3 py-2 text-center">المستهدف</th>
                                            <th className="px-3 py-2 text-center">الوزن</th>
                                            <th className="px-3 py-2 text-center">الفعلي</th>
                                            <th className="px-3 py-2 text-right hidden lg:table-cell">ملاحظات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {insights.objectives.map((obj) => {
                                            const achieved = obj.actualPerformance >= obj.targetForPeriod;
                                            return (
                                                <tr
                                                    key={obj.id}
                                                    className="border-b border-[var(--color-border)] last:border-0"
                                                >
                                                    <td className="px-3 py-2.5 font-medium">
                                                        {obj.id}
                                                    </td>
                                                    <td className="px-3 py-2.5 max-w-[200px]">
                                                        <p className="text-[var(--color-text-primary)] text-xs leading-relaxed">
                                                            {obj.kpiName}
                                                        </p>
                                                    </td>
                                                    <td className="px-3 py-2.5 hidden md:table-cell text-xs text-[var(--color-text-muted)] max-w-[200px]">
                                                        {obj.formula}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center tabular-nums">
                                                        {obj.targetForPeriod}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center tabular-nums">
                                                        {Math.round(obj.relativeWeight * 100)}%
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        <span
                                                            className={`font-semibold tabular-nums ${
                                                                achieved
                                                                    ? "text-[var(--color-success)]"
                                                                    : "text-[var(--color-error)]"
                                                            }`}
                                                        >
                                                            {obj.actualPerformance}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 hidden lg:table-cell text-xs text-[var(--color-text-muted)] max-w-[180px]">
                                                        {obj.notes || "-"}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mini bars per KPI */}
                            <div className="mt-6 space-y-2">
                                <h4 className="text-sm font-medium text-[var(--color-text-dark)] mb-3">
                                    مقارنة المستهدف مع الفعلي
                                </h4>
                                {insights.objectives.map((obj) => {
                                    const pct =
                                        obj.targetForPeriod > 0
                                            ? Math.round(
                                                  (obj.actualPerformance /
                                                      obj.targetForPeriod) *
                                                      100,
                                              )
                                            : 0;
                                    return (
                                        <ProgressBar
                                            key={obj.id}
                                            value={Math.min(pct, 100)}
                                            label={`${obj.id}. ${obj.kpiName.substring(0, 30)}...`}
                                            size="sm"
                                        />
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Competencies Tab */}
                <TabsContent value="competencies">
                    <div className="grid gap-4 md:grid-cols-3">
                        {insights.competencies.map((comp) => (
                            <Card key={comp.id} className="hover-lift">
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        {comp.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-[var(--color-text-muted)] mb-4 leading-relaxed">
                                        {comp.description}
                                    </p>

                                    {/* Level dots */}
                                    <div className="flex items-center gap-2 mb-3">
                                        {comp.levels.map((level) => (
                                            <div
                                                key={level.level}
                                                className={`flex-1 h-2 rounded-full transition-all ${
                                                    level.level <=
                                                    comp.selectedLevel
                                                        ? "bg-[var(--color-primary)]"
                                                        : "bg-[var(--color-surface)]"
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <Badge variant="default">
                                            {comp.selectedLabel}
                                        </Badge>
                                        <span className="text-[var(--color-primary)] font-semibold tabular-nums">
                                            {Math.round(comp.score * 100)}%
                                        </span>
                                    </div>

                                    {/* Selected level description */}
                                    <p className="mt-3 text-xs text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-surface)] rounded-lg p-3">
                                        {comp.levels.find(
                                            (l) =>
                                                l.level ===
                                                comp.selectedLevel,
                                        )?.description ?? ""}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Overall Performance Tab */}
                <TabsContent value="overall">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="flex flex-col items-center justify-center p-8">
                            <ScoreGauge
                                score={overallPerformance.totalPercentage}
                                size="lg"
                            />
                            <Badge
                                variant={
                                    overallPerformance.totalPercentage >= 80
                                        ? "success"
                                        : overallPerformance.totalPercentage >= 60
                                        ? "warning"
                                        : "destructive"
                                }
                                className="mt-4 text-base px-4 py-1"
                            >
                                {overallPerformance.rating}
                            </Badge>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>تفصيل المحاور</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ProgressBar
                                    value={Math.round(
                                        overallPerformance.indicatorsScore * 100,
                                    )}
                                    label={`الإنتاجية وفقاً للمؤشرات (${Math.round(overallPerformance.indicatorsWeight * 100)}%)`}
                                    size="md"
                                />
                                <ProgressBar
                                    value={Math.round(
                                        overallPerformance.competenciesScore * 100,
                                    )}
                                    label={`الجدارات (${Math.round(overallPerformance.competenciesWeight * 100)}%)`}
                                    size="md"
                                />
                                <ProgressBar
                                    value={Math.round(
                                        overallPerformance.administrativeScore *
                                            100,
                                    )}
                                    label={`الالتزام الإداري (${Math.round(overallPerformance.administrativeWeight * 100)}%)`}
                                    size="md"
                                />

                                <div className="border-t border-[var(--color-border)] pt-4 mt-4 text-sm">
                                    <p className="text-[var(--color-text-muted)] text-xs mb-1">
                                        يتم النظر إلى كل محور على حدة فيجب أن يصاحب ارتفاع الإنتاجية ارتفاع في الجدارات والالتزام الإداري
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Strengths & Weaknesses */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[var(--color-success)]">
                                    مواطن القوة
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                    {overallPerformance.strengths || "لم يتم تحديد مواطن قوة محددة"}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[var(--color-warning)]">
                                    مواطن الضعف والتطوير
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                    {overallPerformance.weaknesses || "لم يتم تحديد مواطن ضعف محددة"}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Evidence Tab */}
                <TabsContent value="evidence">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="border-[var(--color-success)]/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[var(--color-success)]">
                                    <Star className="h-5 w-5" />
                                    أدلة التميز
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                                    {insights.evidence.excellent || "لا توجد أدلة تميز مسجلة"}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-[var(--color-error)]/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[var(--color-error)]">
                                    <FileText className="h-5 w-5" />
                                    أدلة الضعف
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                                    {insights.evidence.veryWeak || "لا توجد أدلة ضعف مسجلة"}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Core Competencies Tab */}
                <TabsContent value="core">
                    <div className="space-y-4">
                        {insights.coreCompetencies.map((comp, idx) => (
                            <Card key={idx} className="hover-lift">
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        {idx + 1}. {comp.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-[var(--color-text-muted)] mb-4">
                                        {comp.definition}
                                    </p>
                                    <div className="space-y-3">
                                        {comp.levels.map((level) => (
                                            <div
                                                key={level.level}
                                                className="flex gap-3 rounded-lg border border-[var(--color-border)] p-3"
                                            >
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-bold text-[var(--color-primary)]">
                                                    {level.level}
                                                </div>
                                                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                                    {level.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                </>
                )}
            </Tabs>
        </div>
    );
}
