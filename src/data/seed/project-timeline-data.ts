import type { ProjectInterface } from "@/interfaces";
import { hashStringSeed, seededRandom } from "./prng";
import { project1TimelineData } from "./project-1-timeline-data";

// ── Types ──────────────────────────────────────────────────────────────────

export type TimelineUnitStatus = "مكتمل" | "تحت التنفيذ" | "مرحلة مبكرة" | "متأخر";
export type TimelinePhaseStatus = "مكتمل" | "قيد التنفيذ" | "لم يبدأ";
export type TimelineRiskLevel = "منخفض" | "متوسط" | "مرتفع";

export interface TimelineUnit {
    name: string;
    unitNumber: number;
    batch: number;
    currentStatus: TimelineUnitStatus;
    startDate: string;
    plannedEndDate: string;
    adjustedEndDate: string;
    plannedDurationDays: number;
    currentDelayDays: number;
    currentProgressPct: number;
    currentPhase: string;
    riskLevel: TimelineRiskLevel;
}

export interface TimelinePhase {
    unitNumber: number;
    sequence: number;
    name: string;
    startDate: string;
    endDate: string;
    durationDays: number;
    weight: number;
    status: TimelinePhaseStatus;
    progressPct: number;
    batch: number;
}

export interface TimelineMonthlyAggregation {
    month: string;
    unitsStarted: number;
    unitsDelivered: number;
    cumulativeDelivered: number;
}

export interface TimelineMilestone {
    name: string;
    period: string;
    note: string;
}

export interface TimelineSummary {
    totalUnits: number;
    completedUnits: number;
    inProgressUnits: number;
    earlyUnits: number;
    firstStartDate: string;
    lastEndDate: string;
    avgPlannedDurationDays: number;
    avgCurrentDelayDays: number;
    avgCurrentProgressPct: number;
    yearlyDeliveries: { year: string; count: number }[];
}

export interface TimelineAssumption {
    label: string;
    value: string;
    note: string;
}

export interface TimelineData {
    summary: TimelineSummary;
    assumptions: TimelineAssumption[];
    units: TimelineUnit[];
    phases: TimelinePhase[];
    monthlyAggregation: TimelineMonthlyAggregation[];
    milestones: TimelineMilestone[];
    monthRange: { start: string; end: string; months: string[] };
    rolledUpScore: number;
}

// ── Phase template (verbatim from the Excel timeline file) ────────────────

interface PhaseTemplate {
    name: string;
    weight: number;
    avgDurationFraction: number; // ~ phase duration / unit total
}

const PHASE_TEMPLATES: PhaseTemplate[] = [
    { name: "تجهيز الموقع", weight: 0.05, avgDurationFraction: 0.05 },
    { name: "الحفر والأساسات", weight: 0.12, avgDurationFraction: 0.12 },
    { name: "الهيكل الإنشائي", weight: 0.20, avgDurationFraction: 0.20 },
    { name: "المباني", weight: 0.12, avgDurationFraction: 0.10 },
    { name: "الأعمال الكهروميكانيكية الأولية", weight: 0.14, avgDurationFraction: 0.13 },
    { name: "التشطيبات الداخلية", weight: 0.22, avgDurationFraction: 0.22 },
    { name: "الأعمال الخارجية", weight: 0.08, avgDurationFraction: 0.10 },
    { name: "الاختبارات والتسليم", weight: 0.07, avgDurationFraction: 0.08 },
];

const TODAY_REF = new Date("2026-04-10");

function isoDate(d: Date): string {
    return d.toISOString().split("T")[0];
}

function addDays(base: Date, days: number): Date {
    const out = new Date(base);
    out.setDate(out.getDate() + days);
    return out;
}

function diffDays(a: Date, b: Date): number {
    return Math.round((a.getTime() - b.getTime()) / 86400000);
}

function ymKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ── Generator ──────────────────────────────────────────────────────────────

const cache = new Map<string, TimelineData>();

export function getProjectTimelineData(project: ProjectInterface): TimelineData {
    if (project.id === "1") return project1TimelineData;

    const cached = cache.get(project.id);
    if (cached) return cached;
    const data = generateTimelineData(project);
    cache.set(project.id, data);
    return data;
}

function generateTimelineData(project: ProjectInterface): TimelineData {
    const rand = seededRandom(hashStringSeed(`time-${project.id}`));
    const bias = project.time / 100;
    const stress = 1 - bias;

    const unitCount = project.unitCount;
    const projectStart = new Date(project.startDate);

    // Each unit's planned duration roughly the project total length / 4
    // (units overlap: a 30-month project may have 18-month per-unit duration)
    const projectDurationDays = diffDays(new Date(project.currentEndDate), projectStart);
    const avgUnitDurationDays = Math.max(180, Math.round(projectDurationDays * 0.55));

    // Stagger units in batches
    const batchSize = Math.max(5, Math.min(15, Math.round(unitCount / 10)));
    const stagger = Math.max(3, Math.floor((projectDurationDays * 0.45) / unitCount));

    const units: TimelineUnit[] = [];
    const phases: TimelinePhase[] = [];

    let firstStart: Date | null = null;
    let lastEnd: Date | null = null;

    for (let i = 0; i < unitCount; i++) {
        const batch = Math.floor(i / batchSize) + 1;
        // Each unit's planned start = projectStart + i * stagger
        const unitStart = addDays(projectStart, i * stagger);
        // Per-unit duration varies slightly
        const unitDuration = avgUnitDurationDays + Math.floor((rand() - 0.5) * 60);
        const plannedEnd = addDays(unitStart, unitDuration);
        // Delay correlates with stress + per-unit jitter
        const delayDays = Math.max(0, Math.floor(stress * 25 + rand() * 18 - 5));
        const adjustedEnd = addDays(plannedEnd, delayDays);

        if (!firstStart || unitStart < firstStart) firstStart = unitStart;
        if (!lastEnd || adjustedEnd > lastEnd) lastEnd = adjustedEnd;

        // Determine current status
        const todayMs = TODAY_REF.getTime();
        const startMs = unitStart.getTime();
        const adjustedEndMs = adjustedEnd.getTime();
        const plannedEndMs = plannedEnd.getTime();
        const totalUnitDuration = adjustedEndMs - startMs;
        let currentProgressPct: number;
        let currentStatus: TimelineUnitStatus;
        if (todayMs >= adjustedEndMs) {
            currentProgressPct = 1;
            currentStatus = "مكتمل";
        } else if (todayMs <= startMs) {
            currentProgressPct = 0;
            currentStatus = "مرحلة مبكرة";
        } else {
            currentProgressPct = (todayMs - startMs) / totalUnitDuration;
            // Subtract some progress if there's a delay
            currentProgressPct = Math.max(0, currentProgressPct - delayDays / totalUnitDuration * 0.3);
            currentStatus = todayMs > plannedEndMs && delayDays > 0
                ? "متأخر"
                : "تحت التنفيذ";
        }

        // Generate 8 phases
        let phaseStart = new Date(unitStart);
        let weightProgressed = 0;
        let currentPhaseName = PHASE_TEMPLATES[0].name;
        for (let p = 0; p < PHASE_TEMPLATES.length; p++) {
            const tpl = PHASE_TEMPLATES[p];
            const phaseDuration = Math.max(7, Math.round(unitDuration * tpl.avgDurationFraction));
            const phaseEnd = addDays(phaseStart, phaseDuration);

            // Phase status driven by where today falls in this unit's progress
            const startPct = weightProgressed;
            const endPct = weightProgressed + tpl.weight;
            let phaseStatus: TimelinePhaseStatus;
            let phaseProgressPct: number;
            if (currentProgressPct >= endPct) {
                phaseStatus = "مكتمل";
                phaseProgressPct = 1;
            } else if (currentProgressPct <= startPct) {
                phaseStatus = "لم يبدأ";
                phaseProgressPct = 0;
            } else {
                phaseStatus = "قيد التنفيذ";
                phaseProgressPct = (currentProgressPct - startPct) / (endPct - startPct);
                currentPhaseName = tpl.name;
            }
            // If unit is fully done, every phase is مكتمل
            if (currentStatus === "مكتمل") {
                phaseStatus = "مكتمل";
                phaseProgressPct = 1;
                currentPhaseName = "مكتمل";
            }
            if (currentStatus === "مرحلة مبكرة") {
                phaseStatus = "لم يبدأ";
                phaseProgressPct = 0;
                currentPhaseName = "لم يبدأ";
            }

            phases.push({
                unitNumber: i + 1,
                sequence: p + 1,
                name: tpl.name,
                startDate: isoDate(phaseStart),
                endDate: isoDate(phaseEnd),
                durationDays: phaseDuration,
                weight: tpl.weight,
                status: phaseStatus,
                progressPct: phaseProgressPct,
                batch,
            });

            weightProgressed = endPct;
            phaseStart = addDays(phaseEnd, 1);
        }

        const riskLevel: TimelineRiskLevel = delayDays >= 20 ? "مرتفع" : delayDays >= 8 ? "متوسط" : "منخفض";

        units.push({
            name: `${project.unitType} ${String(i + 1).padStart(3, "0")}`,
            unitNumber: i + 1,
            batch,
            currentStatus,
            startDate: isoDate(unitStart),
            plannedEndDate: isoDate(plannedEnd),
            adjustedEndDate: isoDate(adjustedEnd),
            plannedDurationDays: unitDuration,
            currentDelayDays: delayDays,
            currentProgressPct,
            currentPhase: currentPhaseName,
            riskLevel,
        });
    }

    // ── Monthly aggregation ─────────────────────────────────────────────
    const startedByMonth = new Map<string, number>();
    const deliveredByMonth = new Map<string, number>();
    for (const u of units) {
        const startKey = ymKey(new Date(u.startDate));
        startedByMonth.set(startKey, (startedByMonth.get(startKey) ?? 0) + 1);
        if (u.currentStatus === "مكتمل") {
            const deliverKey = ymKey(new Date(u.adjustedEndDate));
            deliveredByMonth.set(deliverKey, (deliveredByMonth.get(deliverKey) ?? 0) + 1);
        }
    }
    const allMonths = new Set<string>([...startedByMonth.keys(), ...deliveredByMonth.keys()]);
    const sortedMonths = Array.from(allMonths).sort();
    const monthlyAggregation: TimelineMonthlyAggregation[] = [];
    let cum = 0;
    for (const m of sortedMonths) {
        const delivered = deliveredByMonth.get(m) ?? 0;
        cum += delivered;
        monthlyAggregation.push({
            month: m,
            unitsStarted: startedByMonth.get(m) ?? 0,
            unitsDelivered: delivered,
            cumulativeDelivered: cum,
        });
    }

    // ── Month range for Gantt rendering ─────────────────────────────────
    const allMonthsForGantt: string[] = [];
    if (firstStart && lastEnd) {
        const cursor = new Date(firstStart.getFullYear(), firstStart.getMonth(), 1);
        const endMonth = new Date(lastEnd.getFullYear(), lastEnd.getMonth(), 1);
        for (;;) {
            if (cursor > endMonth) break;
            allMonthsForGantt.push(ymKey(cursor));
            cursor.setMonth(cursor.getMonth() + 1);
        }
    }

    // ── Summary ─────────────────────────────────────────────────────────
    const completed = units.filter((u) => u.currentStatus === "مكتمل").length;
    const inProgress = units.filter((u) => u.currentStatus === "تحت التنفيذ" || u.currentStatus === "متأخر").length;
    const earlyStage = units.filter((u) => u.currentStatus === "مرحلة مبكرة").length;
    const avgDuration = units.reduce((s, u) => s + u.plannedDurationDays, 0) / unitCount;
    const avgDelay = units.reduce((s, u) => s + u.currentDelayDays, 0) / unitCount;
    const avgProgress = units.reduce((s, u) => s + u.currentProgressPct, 0) / unitCount;

    const yearMap = new Map<string, number>();
    for (const u of units) {
        const y = u.adjustedEndDate.split("-")[0];
        yearMap.set(y, (yearMap.get(y) ?? 0) + 1);
    }
    const yearlyDeliveries = Array.from(yearMap.entries())
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => a.year.localeCompare(b.year));

    const summary: TimelineSummary = {
        totalUnits: unitCount,
        completedUnits: completed,
        inProgressUnits: inProgress,
        earlyUnits: earlyStage,
        firstStartDate: firstStart ? isoDate(firstStart) : project.startDate,
        lastEndDate: lastEnd ? isoDate(lastEnd) : project.currentEndDate,
        avgPlannedDurationDays: Math.round(avgDuration * 10) / 10,
        avgCurrentDelayDays: Math.round(avgDelay * 10) / 10,
        avgCurrentProgressPct: avgProgress,
        yearlyDeliveries,
    };

    // ── Assumptions ─────────────────────────────────────────────────────
    const assumptions: TimelineAssumption[] = [
        { label: "اسم المشروع", value: project.name, note: `مطابق لمنطق ${project.unitType}` },
        { label: `عدد ${project.unitType}`, value: String(unitCount), note: "ثابت عبر جميع الملفات" },
        { label: `${project.unitType} المكتملة`, value: String(completed), note: `حتى ${isoDate(TODAY_REF)}` },
        { label: `${project.unitType} تحت التنفيذ`, value: String(inProgress), note: `حتى ${isoDate(TODAY_REF)}` },
        { label: `${project.unitType} في المراحل المبكرة`, value: String(earlyStage), note: `حتى ${isoDate(TODAY_REF)}` },
        { label: "تاريخ مرجعي للحالة", value: isoDate(TODAY_REF), note: "يُستخدم لتحديد الحالة الحالية" },
        { label: "مراحل التنفيذ القياسية", value: String(PHASE_TEMPLATES.length), note: "لكل وحدة" },
        { label: "المراحل", value: PHASE_TEMPLATES.map((p) => p.name).join(" | "), note: "تسلسل موحد" },
        { label: "منهجية الجدولة", value: "جدولة متداخلة على دفعات", note: "حتى يكون المشروع منطقياً" },
    ];

    // ── Milestones ──────────────────────────────────────────────────────
    const milestones: TimelineMilestone[] = [];
    if (firstStart) {
        milestones.push({
            name: "بدء أعمال المشروع",
            period: isoDate(firstStart),
            note: `أول دفعة من ${project.unitType}`,
        });
    }
    // Find peak execution period (month with most concurrent in-progress units)
    if (sortedMonths.length > 0) {
        milestones.push({
            name: "مرحلة الذروة التنفيذية",
            period: `${sortedMonths[Math.floor(sortedMonths.length * 0.5)]} - ${sortedMonths[Math.floor(sortedMonths.length * 0.75)]}`,
            note: `أعلى عدد ${project.unitType} متزامنة تحت التنفيذ`,
        });
    }
    // First delivery month
    const firstDelivered = monthlyAggregation.find((m) => m.unitsDelivered > 0);
    if (firstDelivered) {
        milestones.push({
            name: "بدء التسليمات",
            period: firstDelivered.month,
            note: "أول تسليم نهائي ضمن الخطة",
        });
    }
    if (lastEnd) {
        milestones.push({
            name: "إقفال المشروع بالكامل",
            period: isoDate(lastEnd),
            note: "آخر التسليمات",
        });
    }

    // ── Roll-up score ───────────────────────────────────────────────────
    // Time score reflects: low delay + high progress
    const delayScore = Math.max(0, 100 - avgDelay * 1.5);
    const progressScore = avgProgress * 100;
    const onTimeShare = units.filter((u) => u.currentDelayDays <= 5).length / unitCount;
    const onTimeScore = onTimeShare * 100;
    const rolledUpScore = Math.round((delayScore + progressScore + onTimeScore) / 3);

    return {
        summary,
        assumptions,
        units,
        phases,
        monthlyAggregation,
        milestones,
        monthRange: {
            start: allMonthsForGantt[0] ?? "",
            end: allMonthsForGantt[allMonthsForGantt.length - 1] ?? "",
            months: allMonthsForGantt,
        },
        rolledUpScore,
    };
}
