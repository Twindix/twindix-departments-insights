import { useMemo } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { Header, EmptyState } from "@/components/shared";
import { Button } from "@/atoms";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui";
import { routesData, getProjectDetailPath } from "@/data";
import { useDeferredLoad, usePageTitle } from "@/hooks";
import { seedProjects, getProjectTimelineData } from "@/data/seed";
import { ProjectTimeSkeleton } from "./skeleton";
import { TimeOverviewTab } from "./tabs/overview-tab";
import { MainScheduleTab } from "./tabs/main-schedule-tab";
import { PhaseDetailsTab } from "./tabs/phase-details-tab";
import { GanttTab } from "./tabs/gantt-tab";
import { MilestonesTab } from "./tabs/milestones-tab";
import { AssumptionsTab } from "./tabs/assumptions-tab";

const TAB_VALUES = ["overview", "schedule", "phases", "gantt", "milestones", "assumptions"] as const;
type TabValue = (typeof TAB_VALUES)[number];

const TAB_LABELS: Record<TabValue, string> = {
    "overview": "نظرة عامة",
    "schedule": "الجدول الرئيسي",
    "phases": "تفاصيل المراحل",
    "gantt": "مخطط جانت",
    "milestones": "المعالم والتجميع",
    "assumptions": "الافتراضات",
};

const TAB_URL_PREFIXES = ["ms", "ph", "g"];

export function ProjectTimeView() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const isReady = useDeferredLoad(200);

    const project = useMemo(() => seedProjects.find((p) => p.id === id), [id]);
    const timelineData = useMemo(() => (project ? getProjectTimelineData(project) : null), [project]);

    const fromList = (location.state as { from?: string } | null)?.from;

    usePageTitle(project ? `مؤشر الوقت — ${project.name}` : "مؤشر الوقت");

    const tab = (searchParams.get("tab") || "overview") as TabValue;
    const handleTabChange = (value: string) => {
        setSearchParams((prev) => {
            prev.set("tab", value);
            const toDelete: string[] = [];
            prev.forEach((_, key) => {
                if (TAB_URL_PREFIXES.some((p) => key.startsWith(`${p}-`))) {
                    toDelete.push(key);
                }
            });
            for (const k of toDelete) prev.delete(k);
            return prev;
        }, { replace: true });
    };

    if (!isReady) {
        return <ProjectTimeSkeleton />;
    }

    if (!project || !timelineData) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Header
                    title="مشروع غير موجود"
                    description="لم يتم العثور على المشروع المطلوب"
                    actions={
                        <Button
                            variant="outline"
                            onClick={() => navigate(routesData.departmentProjects)}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            العودة للمشاريع
                        </Button>
                    }
                />
                <EmptyState
                    icon={FolderKanban}
                    title="المشروع غير موجود"
                    description="ربما تم حذفه أو أن الرابط غير صحيح."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <Header
                title={`مؤشر الوقت — ${project.name}`}
                description="الجدولة الزمنية، المراحل، والتسليمات"
                actions={
                    <Button
                        variant="outline"
                        onClick={() =>
                            navigate(getProjectDetailPath(project.id), {
                                state: fromList ? { from: fromList } : undefined,
                            })
                        }
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        العودة للمشروع
                    </Button>
                }
            />

            <Tabs value={tab} onValueChange={handleTabChange} dir="rtl">
                <TabsList>
                    {TAB_VALUES.map((v) => (
                        <TabsTrigger key={v} value={v}>
                            {TAB_LABELS[v]}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="overview"><TimeOverviewTab data={timelineData} /></TabsContent>
                <TabsContent value="schedule"><MainScheduleTab data={timelineData} /></TabsContent>
                <TabsContent value="phases"><PhaseDetailsTab data={timelineData} /></TabsContent>
                <TabsContent value="gantt"><GanttTab data={timelineData} /></TabsContent>
                <TabsContent value="milestones"><MilestonesTab data={timelineData} /></TabsContent>
                <TabsContent value="assumptions"><AssumptionsTab data={timelineData} /></TabsContent>
            </Tabs>
        </div>
    );
}
