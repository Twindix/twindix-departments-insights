import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { Header, EmptyState } from "@/components/shared";
import { Button } from "@/atoms";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui";
import {
    routesData,
    getProjectDetailPath,
} from "@/data";
import { useDeferredLoad, usePageTitle } from "@/hooks";
import { seedProjects, getProjectCostData } from "@/data/seed";
import { ProjectCostSkeleton } from "./skeleton";
import { DashboardTab } from "./tabs/dashboard-tab";
import { InputsTab } from "./tabs/inputs-tab";
import { CostStructureTab } from "./tabs/cost-structure-tab";
import { CashFlowTab } from "./tabs/cash-flow-tab";
import { RevenueProfitabilityTab } from "./tabs/revenue-profitability-tab";
import { WasteTab } from "./tabs/waste-tab";
import { ContractorsTab } from "./tabs/contractors-tab";
import { ChangeOrdersTab } from "./tabs/change-orders-tab";
import { RisksTab } from "./tabs/risks-tab";
import { UnitsTab } from "./tabs/units-tab";
import { ExecutiveSummaryTab } from "./tabs/executive-summary-tab";

const TAB_VALUES = [
    "dashboard",
    "inputs",
    "structure",
    "cash-flow",
    "profitability",
    "waste",
    "contractors",
    "change-orders",
    "risks",
    "units",
    "summary",
] as const;
type TabValue = (typeof TAB_VALUES)[number];

const TAB_LABELS: Record<TabValue, string> = {
    "dashboard": "لوحة القيادة",
    "inputs": "المدخلات",
    "structure": "هيكل التكاليف",
    "cash-flow": "التدفق النقدي",
    "profitability": "الإيرادات والربحية",
    "waste": "الهدر والفاقد",
    "contractors": "أداء المقاولين",
    "change-orders": "أوامر التغيير",
    "risks": "المخاطر المالية",
    "units": "توزيع الوحدات",
    "summary": "الملخص التنفيذي",
};

export function ProjectCostView() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const isReady = useDeferredLoad(200);

    const project = useMemo(() => seedProjects.find((p) => p.id === id), [id]);
    const costData = useMemo(() => (project ? getProjectCostData(project) : null), [project]);

    usePageTitle(project ? `مؤشر التكلفة — ${project.name}` : "مؤشر التكلفة");

    const tab = (searchParams.get("tab") || "dashboard") as TabValue;
    const handleTabChange = (value: string) => {
        setSearchParams((prev) => {
            prev.set("tab", value);
            // reset all tab-specific params on switch
            ["co-status", "u-q", "u-status", "u-model", "u-page", "u-limit", "u-sort"].forEach((k) => prev.delete(k));
            return prev;
        }, { replace: true });
    };

    if (!isReady) {
        return <ProjectCostSkeleton />;
    }

    if (!project || !costData) {
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
                title={`مؤشر التكلفة — ${project.name}`}
                description="تحليل تفصيلي للتكاليف، التدفق النقدي، والربحية"
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

                <TabsContent value="dashboard"><DashboardTab data={costData} /></TabsContent>
                <TabsContent value="inputs"><InputsTab data={costData} /></TabsContent>
                <TabsContent value="structure"><CostStructureTab data={costData} /></TabsContent>
                <TabsContent value="cash-flow"><CashFlowTab data={costData} /></TabsContent>
                <TabsContent value="profitability"><RevenueProfitabilityTab data={costData} /></TabsContent>
                <TabsContent value="waste"><WasteTab data={costData} /></TabsContent>
                <TabsContent value="contractors"><ContractorsTab data={costData} /></TabsContent>
                <TabsContent value="change-orders"><ChangeOrdersTab data={costData} /></TabsContent>
                <TabsContent value="risks"><RisksTab data={costData} /></TabsContent>
                <TabsContent value="units"><UnitsTab data={costData} unitTypeLabel={project.unitType} /></TabsContent>
                <TabsContent value="summary"><ExecutiveSummaryTab data={costData} /></TabsContent>
            </Tabs>
        </div>
    );
}
