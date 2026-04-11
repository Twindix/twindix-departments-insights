import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";
import { Header } from "@/components/shared";
import { Button } from "@/atoms";
import { routesData } from "@/data";
import { usePageTitle } from "@/hooks";
import { seedProjects } from "@/data/seed";

interface ProjectPlaceholderViewProps {
    section?: "detail" | "cost" | "quality" | "time";
}

const SECTION_TITLES: Record<NonNullable<ProjectPlaceholderViewProps["section"]>, string> = {
    detail: "تفاصيل المشروع",
    cost: "مؤشر التكلفة",
    quality: "مؤشر الجودة",
    time: "مؤشر الوقت",
};

export function ProjectPlaceholderView({ section = "detail" }: ProjectPlaceholderViewProps) {
    const navigate = useNavigate();
    const { id } = useParams();
    const project = seedProjects.find((p) => p.id === id);

    usePageTitle(`${SECTION_TITLES[section]} — ${project?.name ?? "مشروع"}`);

    return (
        <div className="space-y-6 animate-fade-in">
            <Header
                title={project?.name ?? "مشروع غير موجود"}
                description={SECTION_TITLES[section]}
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
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <Construction className="h-16 w-16 text-[var(--color-text-muted)]" />
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">قريباً</h2>
                <p className="text-sm text-[var(--color-text-muted)] max-w-md">
                    هذه الصفحة قيد التطوير حالياً وستكون متاحة قريباً مع تفاصيل {SECTION_TITLES[section]} الكاملة.
                </p>
            </div>
        </div>
    );
}
