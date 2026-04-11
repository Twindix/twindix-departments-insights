import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { Header, EmptyState } from "@/components/shared";
import { Button } from "@/atoms";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui";
import { routesData, getProjectDetailPath } from "@/data";
import { useDeferredLoad, usePageTitle } from "@/hooks";
import { seedProjects, getProjectQualityData } from "@/data/seed";
import { ProjectQualitySkeleton } from "./skeleton";
import { QualityDashboardTab } from "./tabs/dashboard-tab";
import { QualityInputsTab } from "./tabs/inputs-tab";
import { QualityStructureTab } from "./tabs/structure-tab";
import { VillaTrackingTab } from "./tabs/villa-tracking-tab";
import { InspectionsTab } from "./tabs/inspections-tab";
import { DefectsTab } from "./tabs/defects-tab";
import { MaterialsTab } from "./tabs/materials-tab";
import { ResourceWasteTab } from "./tabs/resource-waste-tab";
import { QualityContractorsTab } from "./tabs/contractors-tab";
import { QualityRisksTab } from "./tabs/risks-tab";
import { HandoverTab } from "./tabs/handover-tab";

const TAB_VALUES = [
    "dashboard",
    "inputs",
    "structure",
    "tracking",
    "inspections",
    "defects",
    "materials",
    "waste",
    "contractors",
    "risks",
    "handover",
] as const;
type TabValue = (typeof TAB_VALUES)[number];

const TAB_LABELS: Record<TabValue, string> = {
    "dashboard": "لوحة التحكم",
    "inputs": "المدخلات",
    "structure": "هيكل الجودة",
    "tracking": "متابعة الوحدات",
    "inspections": "الفحوصات والاختبارات",
    "defects": "العيوب والملاحظات",
    "materials": "المواد والكميات",
    "waste": "هدر الموارد",
    "contractors": "أداء المقاولين",
    "risks": "المخاطر",
    "handover": "الاستلام والتسليم",
};

// All URL prefixes used by the nested tab tables — cleared on tab switch
const TAB_URL_PREFIXES = ["vt", "ins", "def", "ho"];

export function ProjectQualityView() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const isReady = useDeferredLoad(200);

    const project = useMemo(() => seedProjects.find((p) => p.id === id), [id]);
    const qualityData = useMemo(() => (project ? getProjectQualityData(project) : null), [project]);

    usePageTitle(project ? `مؤشر الجودة — ${project.name}` : "مؤشر الجودة");

    const tab = (searchParams.get("tab") || "dashboard") as TabValue;
    const handleTabChange = (value: string) => {
        setSearchParams((prev) => {
            prev.set("tab", value);
            // clear all nested-table params on switch
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
        return <ProjectQualitySkeleton />;
    }

    if (!project || !qualityData) {
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
                title={`مؤشر الجودة — ${project.name}`}
                description="فحوصات، عيوب، مواد، ومتابعة جودة التنفيذ"
                actions={
                    <Button
                        variant="outline"
                        onClick={() => navigate(getProjectDetailPath(project.id))}
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

                <TabsContent value="dashboard"><QualityDashboardTab data={qualityData} /></TabsContent>
                <TabsContent value="inputs"><QualityInputsTab data={qualityData} /></TabsContent>
                <TabsContent value="structure"><QualityStructureTab data={qualityData} /></TabsContent>
                <TabsContent value="tracking"><VillaTrackingTab data={qualityData} unitTypeLabel={project.unitType} /></TabsContent>
                <TabsContent value="inspections"><InspectionsTab data={qualityData} /></TabsContent>
                <TabsContent value="defects"><DefectsTab data={qualityData} /></TabsContent>
                <TabsContent value="materials"><MaterialsTab data={qualityData} /></TabsContent>
                <TabsContent value="waste"><ResourceWasteTab data={qualityData} /></TabsContent>
                <TabsContent value="contractors"><QualityContractorsTab data={qualityData} /></TabsContent>
                <TabsContent value="risks"><QualityRisksTab data={qualityData} /></TabsContent>
                <TabsContent value="handover"><HandoverTab data={qualityData} unitTypeLabel={project.unitType} /></TabsContent>
            </Tabs>
        </div>
    );
}
