import { MapPin, Building2, Users, Calendar, Clock4, Target } from "lucide-react";
import { Card, CardContent, Badge } from "@/atoms";
import { formatDate } from "@/utils";
import { PROJECT_TYPE_META } from "@/data/seed";
import type { ProjectInterface, ProjectStatus } from "@/interfaces";

interface ProjectInfoCardProps {
    project: ProjectInterface;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
    completed: "مكتمل",
    "in-progress": "تحت التنفيذ",
    "early-stage": "مرحلة مبكرة",
    delayed: "متأخر",
};

const STATUS_VARIANTS: Record<ProjectStatus, "default" | "secondary" | "destructive" | "outline"> = {
    completed: "default",
    "in-progress": "secondary",
    "early-stage": "outline",
    delayed: "destructive",
};

function diffInDays(a: string, b: string): number {
    return Math.round(
        (new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24),
    );
}

export function ProjectInfoCard({ project }: ProjectInfoCardProps) {
    const meta = PROJECT_TYPE_META[project.type];
    const delayDays = diffInDays(project.currentEndDate, project.plannedEndDate);

    return (
        <Card>
            <CardContent className="space-y-5 p-6">
                {/* Top row: type + location + status */}
                <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
                        <Building2 className="h-4 w-4 text-[var(--color-primary)]" />
                        {meta.typeLabel}
                    </span>
                    <span className="text-[var(--color-border)]">•</span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                        <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                        {project.location}
                    </span>
                    <span className="text-[var(--color-border)]">•</span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] tabular-nums">
                        <Target className="h-4 w-4 text-[var(--color-primary)]" />
                        {project.unitCount} {project.unitType}
                    </span>
                    <span className="text-[var(--color-border)]">•</span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] tabular-nums">
                        <Users className="h-4 w-4 text-[var(--color-primary)]" />
                        {project.contractorCount} مقاولين
                    </span>
                    <Badge variant={STATUS_VARIANTS[project.status]} className="ms-auto">
                        {STATUS_LABELS[project.status]}
                    </Badge>
                </div>

                {/* Dates row */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                            <Calendar className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-[var(--color-text-muted)]">تاريخ البدء</p>
                            <p className="mt-0.5 text-sm font-semibold text-[var(--color-text-primary)] tabular-nums">
                                {formatDate(project.startDate, "short")}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-success)]/10 text-[var(--color-success)]">
                            <Target className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-[var(--color-text-muted)]">النهاية المخططة</p>
                            <p className="mt-0.5 text-sm font-semibold text-[var(--color-text-primary)] tabular-nums">
                                {formatDate(project.plannedEndDate, "short")}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${delayDays > 0 ? "bg-[var(--color-error)]/10 text-[var(--color-error)]" : "bg-[var(--color-success)]/10 text-[var(--color-success)]"}`}>
                            <Clock4 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-[var(--color-text-muted)]">النهاية المتوقعة</p>
                            <p className="mt-0.5 text-sm font-semibold text-[var(--color-text-primary)] tabular-nums">
                                {formatDate(project.currentEndDate, "short")}
                                {delayDays > 0 && (
                                    <span className="ms-1.5 text-[10px] font-medium text-[var(--color-error)]">
                                        (تأخر {delayDays} يوم)
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Long description */}
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {project.longDescription}
                </p>
            </CardContent>
        </Card>
    );
}
