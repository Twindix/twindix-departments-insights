import type { ProjectInterface } from "@/interfaces";
import { hashStringSeed, seededRandom } from "./prng";

// ── Types ──────────────────────────────────────────────────────────────────

export interface QualityInputItem {
    category: string;
    label: string;
    value: number | string;
    note: string;
}

export interface QualityStructureItem {
    rank: number;
    name: string;
    weight: number;
    measureType: "أعلى أفضل" | "أقل أفضل";
    currentValue: number;
    target: number;
    // 0..1
    score: number;
    achievedWeight: number;
}

export interface VillaTrackingItem {
    unitNumber: number;
    sector: string;
    model: string;
    currentPhase: string;
    progressPct: number;
    contractor: string;
    totalInspections: number;
    firstTimeAccepted: number;
    acceptanceRate: number;
    openDefects: number;
    closedDefects: number;
    reworkCostUsd: number;
    qualityStatus: "مستقرة" | "حرجة" | "تحت المتابعة";
    plannedDeliveryDate: string;
}

export interface InspectionItem {
    id: string;
    date: string;
    unitNumber: number;
    sector: string;
    item: string;
    contractor: string;
    result: "مقبول من أول مرة" | "مقبول بعد إعادة" | "مرفوض";
    repeatCount: number;
    notes: string;
}

export interface DefectItem {
    id: string;
    date: string;
    unitNumber: number;
    sector: string;
    discipline: "إنشائي" | "موقع" | "كهرباء وميكانيك" | "تشطيبات" | "عزل";
    description: string;
    severity: "منخفض" | "متوسط" | "عال" | "حرج";
    status: "مفتوح" | "مغلق";
    responsible: string;
    closureDate: string | null;
    daysToClose: number | null;
    reworkCostUsd: number;
}

export interface QualityMaterialItem {
    name: string;
    unit: string;
    plannedQty: number;
    receivedQty: number;
    issuedQty: number;
    actualUsedQty: number;
    wasteQty: number;
    wastePct: number;
    targetWastePct: number;
    status: "ضمن الهدف" | "بحاجة إلى تحسين";
    unitPriceUsd: number;
    wasteCostUsd: number;
}

export interface QualityResourceWasteItem {
    category: "مواد" | "وقت" | "معدات";
    resource: string;
    unit: string;
    actual: number;
    productive: number;
    waste: number;
    wastePct: number;
    targetPct: number;
    unitPriceUsd: number;
    wasteCostUsd: number;
    notes: string;
}

export interface QualityContractorItem {
    name: string;
    scope: string;
    inspections: number;
    firstTimeAccepted: number;
    acceptanceRate: number;
    openDefects: number;
    reworkCostUsd: number;
    wastePct: number;
    timeAdherence: number;
    finalScore: number;
}

export interface QualityRiskItem {
    id: string;
    description: string;
    category: "توريد" | "تصميم" | "هدر موارد" | "موقع" | "عزل" | "تنفيذ" | "استلام" | "إنتاجية" | "وثائق" | "موردون";
    // 1-5
    probability: number;
    // 1-5
    impact: number;
    riskScore: number;
    response: string;
    status: "منخفض" | "قيد المتابعة" | "قيد المعالجة" | "مرتفع";
}

export interface HandoverItem {
    unitNumber: number;
    sector: string;
    currentPhase: string;
    progressPct: number;
    openDefects: number;
    docsReadiness: number;
    systemsReadiness: number;
    deliveryStatus: "غير جاهزة" | "قيد التجهيز" | "جاهزة للاستلام الابتدائي" | "مستلمة ابتدائيًا";
    plannedDelivery: string;
    expectedDelivery: string;
}

export interface QualityDashboardData {
    totalUnits: number;
    overallProgress: number;
    qualityIndex: number;
    firstTimeAcceptance: number;
    defectClosureRate: number;
    openDefects: number;
    closedDefects: number;
    totalReworkCostUsd: number;
    avgInspectionsPerUnit: number;
    phaseDistribution: { phase: string; count: number }[];
    topPriorities: string[];
}

export interface QualityData {
    dashboard: QualityDashboardData;
    inputs: QualityInputItem[];
    structure: QualityStructureItem[];
    villaTracking: VillaTrackingItem[];
    inspections: InspectionItem[];
    defects: DefectItem[];
    materials: QualityMaterialItem[];
    resourceWaste: QualityResourceWasteItem[];
    contractors: QualityContractorItem[];
    risks: QualityRiskItem[];
    handover: HandoverItem[];
    rolledUpScore: number;
}

// ── Static templates ──────────────────────────────────────────────────────

interface QualityItemTemplate {
    name: string;
    weight: number;
    measureType: "أعلى أفضل" | "أقل أفضل";
}

const QUALITY_ITEMS: QualityItemTemplate[] = [
    { name: "الحوكمة ونظام إدارة الجودة", weight: 0.06, measureType: "أعلى أفضل" },
    { name: "إدارة المخاطر المرتبطة بالجودة", weight: 0.05, measureType: "أعلى أفضل" },
    { name: "ضبط جودة الدراسات والتصميمات", weight: 0.07, measureType: "أعلى أفضل" },
    { name: "إدارة التعاقدات والموردين من منظور الجودة", weight: 0.05, measureType: "أعلى أفضل" },
    { name: "جودة المواد والمنتجات", weight: 0.07, measureType: "أعلى أفضل" },
    { name: "تنفيذ الأعمال الإنشائية", weight: 0.10, measureType: "أعلى أفضل" },
    { name: "تنفيذ الأعمال المعمارية والتشطيبات", weight: 0.08, measureType: "أعلى أفضل" },
    { name: "تنفيذ الأعمال الكهروميكانيكية", weight: 0.08, measureType: "أعلى أفضل" },
    { name: "الفحوصات والاختبارات", weight: 0.07, measureType: "أعلى أفضل" },
    { name: "ضبط العيوب وعدم المطابقة", weight: 0.07, measureType: "أعلى أفضل" },
    { name: "إدارة الهدر والفاقد", weight: 0.05, measureType: "أعلى أفضل" },
    { name: "أداء المقاولين والمصنعية", weight: 0.06, measureType: "أعلى أفضل" },
    { name: "السلامة والصحة المهنية", weight: 0.05, measureType: "أعلى أفضل" },
    { name: "التدريب والكوادر الفنية", weight: 0.05, measureType: "أعلى أفضل" },
    { name: "التوثيق والسجلات", weight: 0.04, measureType: "أعلى أفضل" },
    { name: "التسليم والاستلام", weight: 0.05, measureType: "أعلى أفضل" },
];

const PHASES = [
    "حفر",
    "أساسات",
    "هيكل",
    "كهروميكانيك",
    "تشطيبات",
    "نهائيات",
    "مكتملة",
];

const SECTORS = ["القطاع أ", "القطاع ب", "القطاع ج", "القطاع د"];

const QUALITY_CONTRACTORS = [
    { name: "شركة البنيان المتقدم", scope: "الحفر والأساسات والهيكل" },
    { name: "شركة الإتقان للتشطيبات", scope: "الأعمال المعمارية والتشطيبات" },
    { name: "شركة الأنظمة المتكاملة", scope: "الأعمال الكهربائية والميكانيكية" },
    { name: "شركة الحدائق والخدمات", scope: "الأعمال الخارجية واللاندسكيب" },
];

const INSPECTION_ITEMS = [
    "أعمال الحفر والتسوية",
    "صب الأساسات",
    "تركيب حديد التسليح",
    "صب الهيكل الخرساني",
    "أعمال البلوك",
    "اللياسة والمحارة",
    "تركيب التمديدات الكهربائية",
    "تركيب السباكة والصرف",
    "أعمال العزل",
    "تركيب البلاط والسيراميك",
    "الدهانات الداخلية",
    "تركيب الأبواب والشبابيك",
    "التشطيبات النهائية والاختبارات التشغيلية",
    "الاستلام الابتدائي",
];

const DEFECT_TEMPLATES: { description: string; discipline: DefectItem["discipline"] }[] = [
    { description: "حاجة إلى تحسين دمك التربة حول القواعد الطرفية", discipline: "إنشائي" },
    { description: "عدم تسوية بعض مناطق الردم طبقاً للمناسيب المعتمدة", discipline: "موقع" },
    { description: "تعارض في توزيع التمديدات الكهربائية", discipline: "كهرباء وميكانيك" },
    { description: "تشطيبات لياسة بحاجة إعادة عمل", discipline: "تشطيبات" },
    { description: "اختراقات غير مغلقة في طبقة العزل", discipline: "عزل" },
    { description: "ضبط نهائي لبعض المفاتيح وملحقات السباكة", discipline: "كهرباء وميكانيك" },
    { description: "تحسين النظافة النهائية والمحيط الخارجي", discipline: "موقع" },
    { description: "ملاحظات على جودة الدهانات الداخلية", discipline: "تشطيبات" },
    { description: "إعادة معالجة بعض شقوق المحارة", discipline: "تشطيبات" },
    { description: "ملاحظات تركيب البلاط في الحمامات", discipline: "تشطيبات" },
];

const MATERIAL_TEMPLATES = [
    { name: "خرسانة جاهزة", unit: "م3", priceUsd: 320, target: 0.030 },
    { name: "حديد تسليح", unit: "طن", priceUsd: 3300, target: 0.025 },
    { name: "بلوك إسمنتي", unit: "م2", priceUsd: 48, target: 0.040 },
    { name: "عزل مائي وحراري", unit: "م2", priceUsd: 38, target: 0.030 },
    { name: "لياسة ومحارة", unit: "م2", priceUsd: 24, target: 0.050 },
    { name: "بلاط وسيراميك", unit: "م2", priceUsd: 72, target: 0.040 },
    { name: "دهانات", unit: "م2", priceUsd: 18, target: 0.060 },
    { name: "كوابل كهربائية", unit: "م.ط", priceUsd: 14, target: 0.020 },
    { name: "مواسير صحية وميكانيكية", unit: "م.ط", priceUsd: 26, target: 0.020 },
];

const RISK_TEMPLATES: { description: string; category: QualityRiskItem["category"] }[] = [
    { description: "تأخر اعتماد بعض المواد البديلة يؤدي لإعادة ترتيب الجدول", category: "توريد" },
    { description: "تعارضات بين التمديدات المعمارية والكهروميكانيكية", category: "تصميم" },
    { description: "ارتفاع هدر البلوك واللياسة بسبب تعديلات ميدانية", category: "هدر موارد" },
    { description: "ضعف نظافة الموقع يؤثر على جودة التشطيبات النهائية", category: "موقع" },
    { description: "إعادة عمل في العزل بسبب اختراقات خدمات غير مغلقة", category: "عزل" },
    { description: "انخفاض معدل القبول من أول مرة في التشطيبات", category: "تنفيذ" },
    { description: "تأخر إغلاق العيوب المفتوحة في الوحدات المكتملة", category: "استلام" },
    { description: "إجهاد فرق العمل نتيجة تداخل الأنشطة", category: "إنتاجية" },
    { description: "عدم اكتمال وثائق التسليم لبعض الوحدات", category: "وثائق" },
    { description: "عدم ثبات جودة المورد لبعض التشطيبات الحساسة", category: "موردون" },
];

const RISK_RESPONSES = [
    "منع أي بديل غير معتمد وإقفال قرار الشراء قبل التنفيذ بأسبوعين",
    "مراجعة تنسيقية أسبوعية للرسومات التنفيذية",
    "ضبط العمل قبل التنفيذ ومنع التكسير غير المعتمد",
    "خطة تنظيف يومية ومناطق تجميع واضحة للمخلفات",
    "فحص نقاط الاختراق قبل وبعد الإغلاق",
    "تعزيز إشراف ما قبل الفحص وقوائم تحقق للغرف النموذجية",
    "تحديد مدة إغلاق قصوى وربطها بخطة تسليم أسبوعية",
    "إعادة موازنة الموارد بين القطاعات",
    "مراجعة أسبوعية لحزمة التسليم لكل فيلا",
    "اعتماد عينات مسبقة ومراجعة دفعات الاستلام",
];

// ── Generator ──────────────────────────────────────────────────────────────

const cache = new Map<string, QualityData>();

export function getProjectQualityData(project: ProjectInterface): QualityData {
    const cached = cache.get(project.id);
    if (cached) return cached;
    const data = generateQualityData(project);
    cache.set(project.id, data);
    return data;
}

function addDays(base: Date, days: number): Date {
    const out = new Date(base);
    out.setDate(out.getDate() + days);
    return out;
}

function isoDate(d: Date): string {
    return d.toISOString().split("T")[0];
}

function generateQualityData(project: ProjectInterface): QualityData {
    const rand = seededRandom(hashStringSeed(`quality-${project.id}`));
    const bias = project.quality / 100;
    const stress = 1 - bias;

    const unitCount = project.unitCount;
    const startDate = new Date(project.startDate);
    const today = new Date("2026-04-10");

    // ── Quality structure (16 weighted items) ────────────────────────────
    const structure: QualityStructureItem[] = QUALITY_ITEMS.map((it, i) => {
        const target = 0.85 + rand() * 0.10;
        const noise = (rand() - 0.5) * 0.08;
        const current = Math.max(0.4, Math.min(1.0, bias * 0.95 + 0.05 + noise));
        const score = Math.min(1, current / target);
        return {
            rank: i + 1,
            name: it.name,
            weight: it.weight,
            measureType: it.measureType,
            currentValue: current,
            target,
            score,
            achievedWeight: it.weight * score,
        };
    });
    const totalAchievedWeight = structure.reduce((s, q) => s + q.achievedWeight, 0);
    const qualityIndex = totalAchievedWeight; // 0..1

    // ── Villa tracking ───────────────────────────────────────────────────
    const villaTracking: VillaTrackingItem[] = [];
    const completedShare = project.status === "completed" ? 0.85
        : project.status === "early-stage" ? 0.10
            : project.status === "delayed" ? 0.30 : 0.25;
    const earlyShare = project.status === "early-stage" ? 0.50
        : project.status === "completed" ? 0.05 : 0.30;

    const completedCount = Math.round(unitCount * completedShare);
    const earlyCount = Math.round(unitCount * earlyShare);

    const inspectionsPerUnit = 5 + Math.floor(rand() * 3); // 5-7
    let totalInspections = 0;
    let totalFirstTime = 0;
    let totalReworkCost = 0;

    for (let i = 0; i < unitCount; i++) {
        const isCompleted = i < completedCount;
        const isEarly = i >= unitCount - earlyCount;
        const phase = isCompleted ? "مكتملة" : isEarly ? PHASES[0] : PHASES[Math.min(5, Math.floor(rand() * 6))];
        const progress = isCompleted ? 0.95 + rand() * 0.04 : isEarly ? 0.10 + rand() * 0.15 : 0.30 + rand() * 0.55;
        const sector = SECTORS[i % SECTORS.length];
        const contractor = QUALITY_CONTRACTORS[i % QUALITY_CONTRACTORS.length].name;

        const completedInspections = isCompleted ? inspectionsPerUnit + 2 : isEarly ? 1 : Math.max(1, Math.floor(inspectionsPerUnit * progress));
        const firstTimeRate = 0.70 + bias * 0.25 - rand() * 0.10;
        const firstTime = Math.round(completedInspections * firstTimeRate);
        const acceptanceRate = completedInspections > 0 ? firstTime / completedInspections : 1;

        const openDefects = isCompleted ? Math.floor(rand() * 4) : Math.floor(rand() * 5 + stress * 3);
        const closedDefects = Math.floor(rand() * 5 + (isCompleted ? 4 : 0));
        const reworkCostUnit = Math.round((openDefects + closedDefects) * 600 + rand() * 4000 + stress * 2000);

        totalInspections += completedInspections;
        totalFirstTime += firstTime;
        totalReworkCost += reworkCostUnit;

        const plannedDelivery = addDays(startDate, 60 + i * 3 + 365);
        const status: VillaTrackingItem["qualityStatus"] = openDefects >= 4 ? "حرجة" : openDefects >= 2 ? "تحت المتابعة" : "مستقرة";

        villaTracking.push({
            unitNumber: i + 1,
            sector,
            model: ["نموذج أ", "نموذج ب", "نموذج ج"][i % 3],
            currentPhase: phase,
            progressPct: progress,
            contractor,
            totalInspections: completedInspections,
            firstTimeAccepted: firstTime,
            acceptanceRate,
            openDefects,
            closedDefects,
            reworkCostUsd: reworkCostUnit,
            qualityStatus: status,
            plannedDeliveryDate: isoDate(plannedDelivery),
        });
    }

    // ── Inspections (~5-7 per villa) ─────────────────────────────────────
    const inspections: InspectionItem[] = [];
    let inspId = 1;
    for (const v of villaTracking) {
        for (let j = 0; j < v.totalInspections; j++) {
            const dateOffset = j * 30 + Math.floor(rand() * 12);
            const date = addDays(startDate, dateOffset + v.unitNumber * 2);
            const isFirstTime = j < v.firstTimeAccepted;
            const result: InspectionItem["result"] = isFirstTime
                ? "مقبول من أول مرة"
                : rand() > 0.85
                    ? "مرفوض"
                    : "مقبول بعد إعادة";
            inspections.push({
                id: `فحص-${String(inspId).padStart(4, "0")}`,
                date: isoDate(date),
                unitNumber: v.unitNumber,
                sector: v.sector,
                item: INSPECTION_ITEMS[(j + v.unitNumber) % INSPECTION_ITEMS.length],
                contractor: v.contractor,
                result,
                repeatCount: result === "مقبول من أول مرة" ? 0 : result === "مقبول بعد إعادة" ? 1 : 2,
                notes:
                    result === "مقبول من أول مرة"
                        ? "تم الفحص وفق الخطة واعتماد العمل دون ملاحظات جوهرية"
                        : result === "مقبول بعد إعادة"
                            ? "تمت المعالجة وإعادة الفحص واعتماد البند"
                            : "البند غير مطابق ويحتاج إعادة عمل كاملة",
            });
            inspId++;
        }
    }

    // ── Defects (~3-4 per villa) ─────────────────────────────────────────
    const defects: DefectItem[] = [];
    let defId = 1;
    const defectsPerVilla = 3 + (stress > 0.4 ? 1 : 0);
    for (const v of villaTracking) {
        for (let j = 0; j < defectsPerVilla + Math.floor(rand() * 2); j++) {
            const tpl = DEFECT_TEMPLATES[(j + v.unitNumber) % DEFECT_TEMPLATES.length];
            const date = addDays(startDate, 100 + Math.floor(rand() * 400));
            const severityRoll = rand();
            const severity: DefectItem["severity"] =
                severityRoll < 0.5 ? "منخفض"
                    : severityRoll < 0.8 ? "متوسط"
                        : severityRoll < 0.95 ? "عال"
                            : "حرج";
            const isClosed = j < v.closedDefects;
            const closureDate = isClosed ? addDays(date, 5 + Math.floor(rand() * 25)) : null;
            const daysToClose = isClosed && closureDate ? Math.round((closureDate.getTime() - date.getTime()) / 86400000) : null;
            const reworkCostUsd = Math.round(400 + rand() * 4500 + (severity === "حرج" ? 2000 : severity === "عال" ? 1000 : 0));

            defects.push({
                id: `عيب-${String(defId).padStart(4, "0")}`,
                date: isoDate(date),
                unitNumber: v.unitNumber,
                sector: v.sector,
                discipline: tpl.discipline,
                description: tpl.description,
                severity,
                status: isClosed ? "مغلق" : "مفتوح",
                responsible: v.contractor,
                closureDate: closureDate ? isoDate(closureDate) : null,
                daysToClose,
                reworkCostUsd,
            });
            defId++;
            if (defects.length > unitCount * 4) break;
        }
        if (defects.length > unitCount * 4) break;
    }

    const openDefects = defects.filter((d) => d.status === "مفتوح").length;
    const closedDefects = defects.filter((d) => d.status === "مغلق").length;
    const defectClosureRate = defects.length > 0 ? closedDefects / defects.length : 1;

    // ── Materials ────────────────────────────────────────────────────────
    const materials: QualityMaterialItem[] = MATERIAL_TEMPLATES.map((m) => {
        const planned = Math.round(unitCount * (200 + rand() * 100));
        const wastePct = m.target * (0.7 + stress * 1.0 + (rand() - 0.5) * 0.3);
        const waste = Math.round(planned * wastePct);
        const used = planned - waste;
        const received = planned + Math.round(planned * 0.02);
        const issued = used + waste;
        return {
            name: m.name,
            unit: m.unit,
            plannedQty: planned,
            receivedQty: received,
            issuedQty: issued,
            actualUsedQty: used,
            wasteQty: waste,
            wastePct,
            targetWastePct: m.target,
            status: wastePct <= m.target ? "ضمن الهدف" : "بحاجة إلى تحسين",
            unitPriceUsd: m.priceUsd,
            wasteCostUsd: Math.round(waste * m.priceUsd),
        };
    });

    // ── Resource waste ───────────────────────────────────────────────────
    const resourceWaste: QualityResourceWasteItem[] = [
        ...materials.map((m) => ({
            category: "مواد" as const,
            resource: m.name,
            unit: m.unit,
            actual: m.issuedQty,
            productive: m.actualUsedQty,
            waste: m.wasteQty,
            wastePct: m.wastePct,
            targetPct: m.targetWastePct,
            unitPriceUsd: m.unitPriceUsd,
            wasteCostUsd: m.wasteCostUsd,
            notes: "يرتبط مباشرة بالصرف الفعلي في الموقع",
        })),
        {
            category: "وقت",
            resource: "ساعات العمل",
            unit: "ساعة",
            actual: Math.round(unitCount * 1500),
            productive: Math.round(unitCount * 1500 * (0.92 - stress * 0.08)),
            waste: Math.round(unitCount * 1500 * (0.08 + stress * 0.08)),
            wastePct: 0.08 + stress * 0.08,
            targetPct: 0.08,
            unitPriceUsd: 42,
            wasteCostUsd: Math.round(unitCount * 1500 * (0.08 + stress * 0.08) * 42),
            notes: "الهدر ناتج عن إعادة عمل وانتظار وتداخل فرق",
        },
        {
            category: "معدات",
            resource: "ساعات تشغيل المعدات",
            unit: "ساعة",
            actual: Math.round(unitCount * 60),
            productive: Math.round(unitCount * 60 * (0.95 - stress * 0.05)),
            waste: Math.round(unitCount * 60 * (0.05 + stress * 0.05)),
            wastePct: 0.05 + stress * 0.05,
            targetPct: 0.05,
            unitPriceUsd: 95,
            wasteCostUsd: Math.round(unitCount * 60 * (0.05 + stress * 0.05) * 95),
            notes: "الهدر مرتبط بتعطل المعدات وضعف التنسيق",
        },
    ];

    // ── Contractors ──────────────────────────────────────────────────────
    const contractors: QualityContractorItem[] = QUALITY_CONTRACTORS.map((c) => {
        const cInsp = Math.round(totalInspections * (0.20 + rand() * 0.15));
        const cFirstTime = Math.round(cInsp * (0.78 + bias * 0.18 - rand() * 0.05));
        return {
            name: c.name,
            scope: c.scope,
            inspections: cInsp,
            firstTimeAccepted: cFirstTime,
            acceptanceRate: cInsp > 0 ? cFirstTime / cInsp : 0,
            openDefects: Math.round(openDefects * (0.18 + rand() * 0.12)),
            reworkCostUsd: Math.round(totalReworkCost * (0.22 + rand() * 0.10)),
            wastePct: 0.020 + rand() * 0.030 + stress * 0.015,
            timeAdherence: Math.max(0.7, 0.95 - stress * 0.20 - rand() * 0.05),
            finalScore: Math.round(60 + bias * 35 - rand() * 8),
        };
    });

    // ── Risks ────────────────────────────────────────────────────────────
    const risks: QualityRiskItem[] = RISK_TEMPLATES.map((r, i) => {
        const probability = Math.min(5, Math.max(1, 2 + Math.floor(rand() * 3 + stress * 2)));
        const impact = Math.min(5, Math.max(1, 3 + Math.floor(rand() * 2 + stress * 2)));
        const score = probability * impact;
        return {
            id: `خطر-${String(i + 1).padStart(2, "0")}`,
            description: r.description,
            category: r.category,
            probability,
            impact,
            riskScore: score,
            response: RISK_RESPONSES[i % RISK_RESPONSES.length],
            status: score >= 16 ? "مرتفع" : score >= 12 ? "قيد المعالجة" : score >= 8 ? "قيد المتابعة" : "منخفض",
        };
    });

    // ── Handover ─────────────────────────────────────────────────────────
    const handover: HandoverItem[] = villaTracking.map((v) => {
        const docsRead = v.currentPhase === "مكتملة" ? 0.90 + rand() * 0.10 : 0.10 + rand() * 0.40 * (v.progressPct / 0.5);
        const sysRead = v.currentPhase === "مكتملة" ? 0.85 + rand() * 0.15 : 0.05 + rand() * 0.35 * (v.progressPct / 0.5);
        const status: HandoverItem["deliveryStatus"] =
            v.currentPhase === "مكتملة" && v.openDefects === 0 ? "مستلمة ابتدائيًا"
                : v.currentPhase === "مكتملة" ? "جاهزة للاستلام الابتدائي"
                    : v.progressPct > 0.7 ? "قيد التجهيز"
                        : "غير جاهزة";
        const planned = new Date(v.plannedDeliveryDate);
        const expected = addDays(planned, Math.floor(rand() * 90 + (1 - v.progressPct) * 60));
        return {
            unitNumber: v.unitNumber,
            sector: v.sector,
            currentPhase: v.currentPhase,
            progressPct: v.progressPct,
            openDefects: v.openDefects,
            docsReadiness: docsRead,
            systemsReadiness: sysRead,
            deliveryStatus: status,
            plannedDelivery: v.plannedDeliveryDate,
            expectedDelivery: isoDate(expected),
        };
    });

    // ── Inputs ───────────────────────────────────────────────────────────
    const inputs: QualityInputItem[] = [
        { category: "بيانات المشروع الأساسية", label: "اسم المشروع", value: project.name, note: "" },
        { category: "بيانات المشروع الأساسية", label: "تاريخ البدء", value: project.startDate, note: "" },
        { category: "بيانات المشروع الأساسية", label: "تاريخ التقرير", value: isoDate(today), note: "حتى تاريخ التقرير" },
        { category: "بيانات المشروع الأساسية", label: `عدد ${project.unitType}`, value: unitCount, note: "" },
        { category: "بيانات المشروع الأساسية", label: "عدد القطاعات", value: SECTORS.length, note: "" },
        { category: "المؤشرات المرجعية", label: "متوسط الإنجاز التراكمي المستهدف", value: 0.58, note: "حتى تاريخ التقرير" },
        { category: "المؤشرات المرجعية", label: "متوسط الإنجاز الفعلي", value: villaTracking.reduce((s, v) => s + v.progressPct, 0) / unitCount, note: "" },
        { category: "المؤشرات المرجعية", label: "إجمالي الفحوصات", value: totalInspections, note: "تراكمي" },
        { category: "المؤشرات المرجعية", label: "إجمالي العيوب", value: defects.length, note: "مفتوح + مغلق" },
    ];

    // ── Dashboard ────────────────────────────────────────────────────────
    const phaseDistribution = PHASES.map((phase) => ({
        phase,
        count: villaTracking.filter((v) => v.currentPhase === phase).length,
    }));
    const overallProgress = villaTracking.reduce((s, v) => s + v.progressPct, 0) / unitCount;

    const dashboard: QualityDashboardData = {
        totalUnits: unitCount,
        overallProgress,
        qualityIndex,
        firstTimeAcceptance: totalInspections > 0 ? totalFirstTime / totalInspections : 0,
        defectClosureRate,
        openDefects,
        closedDefects,
        totalReworkCostUsd: totalReworkCost,
        avgInspectionsPerUnit: totalInspections / unitCount,
        phaseDistribution,
        topPriorities: [
            "خفض هدر اللياسة والدهانات وربطه بالاستلام الموقعي",
            "رفع القبول من أول مرة في التشطيبات النهائية",
            "إغلاق العيوب الحرجة قبل دفعة التسليم التالية",
            "الاستمرار في تحديث سجل المخاطر وربطه بالقرار التنفيذي",
        ],
    };

    // ── Roll-up ─────────────────────────────────────────────────────────
    const rolledUpScore = Math.round(qualityIndex * 100);

    return {
        dashboard,
        inputs,
        structure,
        villaTracking,
        inspections,
        defects,
        materials,
        resourceWaste,
        contractors,
        risks,
        handover,
        rolledUpScore,
    };
}
