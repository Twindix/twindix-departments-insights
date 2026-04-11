import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { Header, ProgressBar, EmptyState } from "@/components/shared";
import { Button, Card, CardContent } from "@/atoms";
import {
    routesData,
    getProjectCostPath,
    getProjectQualityPath,
    getProjectTimePath,
} from "@/data";
import { useDeferredLoad, usePageTitle } from "@/hooks";
import { seedProjects } from "@/data/seed";
import { ProjectInfoCard } from "./project-info-card";
import { IndicatorCard } from "./indicator-card";
import { ProjectDetailSkeleton } from "./skeleton";

export function ProjectDetailView() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const isReady = useDeferredLoad(200);

    const project = useMemo(() => seedProjects.find((p) => p.id === id), [id]);
    // The original list URL we came from (preserved through indicator drill-downs)
    const fromList =
        (location.state as { from?: string } | null)?.from
        ?? routesData.departmentProjects;
    // Forward state to indicator pages so their back chain still ends at the list
    const navState = { from: fromList };

    usePageTitle(project ? project.name : "مشروع غير موجود");

    if (!isReady) {
        return <ProjectDetailSkeleton />;
    }

    if (!project) {
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
                    description="ربما تم حذفه أو أن الرابط غير صحيح. يمكنك العودة لقائمة المشاريع لاختيار مشروع آخر."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <Header
                title={project.name}
                description={project.description}
                actions={
                    <Button
                        variant="outline"
                        onClick={() => navigate(fromList)}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        العودة للمشاريع
                    </Button>
                }
            />

            <ProjectInfoCard project={project} />

            {/* 3 clickable indicator cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <IndicatorCard
                    variant="cost"
                    value={project.cost}
                    onClick={() => navigate(getProjectCostPath(project.id), { state: navState })}
                />
                <IndicatorCard
                    variant="time"
                    value={project.time}
                    onClick={() => navigate(getProjectTimePath(project.id), { state: navState })}
                />
                <IndicatorCard
                    variant="quality"
                    value={project.quality}
                    onClick={() => navigate(getProjectQualityPath(project.id), { state: navState })}
                />
            </div>

            {/* Overall performance summary */}
            <Card>
                <CardContent className="p-6">
                    <ProgressBar
                        value={project.avgPerformance}
                        label="الأداء العام للمشروع"
                        size="lg"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
