import type { ProjectInterface } from "@/interfaces";
import { hashStringSeed, seededRandom } from "./prng";
import { project1CostData } from "./project-1-cost-data";

// ── Types (one per Excel sheet) ────────────────────────────────────────────

export interface CostInputItem {
    category: string;
    label: string;
    value: number;
    unit: string;
    note: string;
    source: string;
    inputType: "مدخل" | "ناتج";
}

export interface CostStructureItem {
    level1: string;
    level2: string;
    originalBudget: number;
    reestimated: number;
    actualToDate: number;
    variance: number;
    variancePct: number;
    spendPct: number;
    sharePct: number;
    notes: string;
}

export interface CashFlowMonth {
    month: string;
    plannedSpend: number;
    actualSpend: number;
    revenueCollected: number;
    netMonthly: number;
    netCumulative: number;
    spendPctCum: number;
    collectionPctCum: number;
    notes: string;
    status: "منقضي" | "حالي" | "مستقبلي";
}

export interface ProfitabilityRow {
    label: string;
    value: number;
    formula: string;
}

export interface SensitiveIndicator {
    name: string;
    value: number;
    unit: string;
    formula: string;
    reading: string;
    status: "جيد" | "مقبول" | "تحذير" | "حرج";
    recommendation: string;
}

export interface ProfitabilityData {
    contractedRevenue: number;
    originalBudget: number;
    plannedGrossProfit: number;
    recognizedRevenue: number;
    actualCostToDate: number;
    realizedProfit: number;
    eac: number;
    expectedFinalProfit: number;
    expectedMargin: number;
    avgUnitPrice: number;
    avgFinalCostPerUnit: number;
    avgProfitPerUnit: number;
    completedUnits: { count: number; revenue: number; cost: number; profit: number };
    inProgressUnits: { count: number; revenue: number; cost: number; profit: number };
    earlyUnits: { count: number; revenue: number; cost: number; profit: number };
    sensitiveIndicators: SensitiveIndicator[];
}

export interface WasteItem {
    resource: string;
    unit: string;
    plannedQty: number;
    consumedQty: number;
    wasteQty: number;
    wastePct: number;
    unitPrice: number;
    wasteCost: number;
    targetWastePct: number;
    notes: string;
}

export interface CostContractorItem {
    name: string;
    scope: string;
    contractValue: number;
    spentToDate: number;
    eac: number;
    contractVariance: number;
    wastePct: number;
    reworkCost: number;
    qualityScore: number;
    notes: string;
}

export interface ChangeOrder {
    id: string;
    description: string;
    reason: string;
    value: number;
    timeImpactDays: number;
    status: "معتمد" | "قيد التنفيذ" | "منجز" | "مرفوض";
    approver: string;
    affectedItem: string;
    notes: string;
}

export interface CostRiskItem {
    risk: string;
    probability: number;
    impact: number;
    exposure: number;
    response: string;
    owner: string;
    status: "قائم" | "مخفف" | "مغلق";
    remainingExposure: number;
    notes: string;
}

export interface UnitCostItem {
    unitNumber: number;
    model: string;
    area: number;
    status: "مكتملة" | "تحت التنفيذ" | "مرحلة مبكرة";
    progressPct: number;
    plannedBudget: number;
    actualToDate: number;
    eac: number;
    salePrice: number;
    revenueRecognized: number;
    expectedProfit: number;
    openIssues: number;
    reworkCost: number;
    estimatedWasteCost: number;
}

export interface ExecSummaryItem {
    axis: string;
    indicator: string;
    value: number;
    unit: string;
    target: number;
    gap: number;
    status: "إيجابي" | "متوسط" | "تحذير" | "مطابق" | "مقبول";
    recommendation: string;
}

export interface CostDashboardData {
    contractedRevenue: number;
    originalBudget: number;
    eac: number;
    expectedFinalProfit: number;
    expectedMargin: number;
    actualSpendToDate: number;
    revenueRecognizedToDate: number;
    completionPct: number;
    actualWastePct: number;
    reworkCost: number;
    completedUnits: number;
    inProgressUnits: number;
    earlyUnits: number;
    cashFlowSparkline: number[];
    statusBreakdown: { status: string; count: number; expectedCost: number; expectedRevenue: number }[];
}

export interface CostData {
    inputs: CostInputItem[];
    structure: CostStructureItem[];
    cashFlow: CashFlowMonth[];
    profitability: ProfitabilityData;
    waste: WasteItem[];
    contractors: CostContractorItem[];
    changeOrders: ChangeOrder[];
    risks: CostRiskItem[];
    units: UnitCostItem[];
    summary: ExecSummaryItem[];
    dashboard: CostDashboardData;
    rolledUpScore: number;
}

// ── Static templates (mirror the Excel structure) ─────────────────────────

interface CategoryTemplate {
    level1: string;
    level2: string;
    sharePct: number; // share of total budget
    notes: string;
}

const COST_CATEGORIES: CategoryTemplate[] = [
    { level1: "أعمال تمهيدية", level2: "تجهيز الموقع والرفع المساحي", sharePct: 0.016, notes: "تسوية الموقع وإعداد البنية" },
    { level1: "أعمال تمهيدية", level2: "مرافق مؤقتة وسياج ومكاتب", sharePct: 0.011, notes: "ضمن الحدود المقبولة" },
    { level1: "الأعمال الإنشائية", level2: "حفر وردم", sharePct: 0.047, notes: "تحت السيطرة" },
    { level1: "الأعمال الإنشائية", level2: "أساسات", sharePct: 0.088, notes: "مستقرة" },
    { level1: "الأعمال الإنشائية", level2: "هيكل خرساني", sharePct: 0.202, notes: "أكبر بند تكلفة" },
    { level1: "الأعمال المعمارية", level2: "مباني وبلوك", sharePct: 0.060, notes: "متناسق مع التقدم" },
    { level1: "الأعمال المعمارية", level2: "لياسة ومحارة", sharePct: 0.048, notes: "مرتبط بإنتاجية الفرق" },
    { level1: "الأعمال المعمارية", level2: "أرضيات وكسوات", sharePct: 0.067, notes: "جزء كبير قيد التنفيذ" },
    { level1: "الأعمال المعمارية", level2: "دهانات وأسقف", sharePct: 0.035, notes: "مرحلة لاحقة" },
    { level1: "الأعمال الكهروميكانيكية", level2: "كهرباء", sharePct: 0.085, notes: "ضمن المتوقع" },
    { level1: "الأعمال الكهروميكانيكية", level2: "سباكة وصرف", sharePct: 0.055, notes: "ضمن المتوقع" },
    { level1: "الأعمال الكهروميكانيكية", level2: "تكييف وتهوية", sharePct: 0.034, notes: "تحسن بعد اتفاقيات الشراء" },
    { level1: "الأعمال الخارجية", level2: "طرق ولاندسكيب وسور", sharePct: 0.082, notes: "تتأثر بالطلبات التسويقية" },
    { level1: "إدارة المشروع والإشراف", level2: "إدارة المشروع والإشراف", sharePct: 0.045, notes: "ثابتة نسبيًا" },
    { level1: "احتياطي المخاطر", level2: "احتياطي المخاطر", sharePct: 0.045, notes: "للطوارئ والتأخيرات" },
    { level1: "تكاليف عامة وتمويلية", level2: "تكاليف عامة وتمويلية", sharePct: 0.080, notes: "تشمل الفوائد والتأمين" },
];

interface WasteTemplate {
    resource: string;
    unit: string;
    sharePct: number; // share of total material spend
    unitPriceUsd: number;
    targetWastePct: number;
    notes: string;
}

const WASTE_TEMPLATES: WasteTemplate[] = [
    { resource: "خرسانة جاهزة", unit: "م3", sharePct: 0.18, unitPriceUsd: 112, targetWastePct: 0.020, notes: "هدر محدود من إعادة الصب" },
    { resource: "حديد تسليح", unit: "طن", sharePct: 0.16, unitPriceUsd: 925, targetWastePct: 0.018, notes: "فواقد تقطيع" },
    { resource: "بلوك ومباني", unit: "م2", sharePct: 0.06, unitPriceUsd: 8.5, targetWastePct: 0.022, notes: "تلف ومناولة" },
    { resource: "محارة", unit: "م2", sharePct: 0.05, unitPriceUsd: 6.2, targetWastePct: 0.025, notes: "ضمن المعدل" },
    { resource: "سيراميك وبورسلان", unit: "م2", sharePct: 0.07, unitPriceUsd: 19, targetWastePct: 0.025, notes: "فاقد تقطيع" },
    { resource: "دهانات", unit: "لتر", sharePct: 0.04, unitPriceUsd: 4.8, targetWastePct: 0.020, notes: "هدر ناتج عن الإعادة" },
    { resource: "كيابل وأسلاك", unit: "متر", sharePct: 0.05, unitPriceUsd: 1.35, targetWastePct: 0.018, notes: "زيادات أطوال" },
    { resource: "مواسير وتوصيلات", unit: "متر", sharePct: 0.04, unitPriceUsd: 2.9, targetWastePct: 0.020, notes: "ضمن نطاق مقبول" },
    { resource: "عزل مائي", unit: "م2", sharePct: 0.03, unitPriceUsd: 7.4, targetWastePct: 0.020, notes: "زيادة بسبب مناطق إضافية" },
    { resource: "أخشاب وشدات", unit: "م2", sharePct: 0.03, unitPriceUsd: 5.1, targetWastePct: 0.025, notes: "تحسن في الدورة الأخيرة" },
    { resource: "وقت عمالة مباشرة", unit: "ساعة", sharePct: 0.13, unitPriceUsd: 9.2, targetWastePct: 0.020, notes: "إعادة عمل وانتظار" },
    { resource: "معدات ومناولة", unit: "ساعة", sharePct: 0.04, unitPriceUsd: 38, targetWastePct: 0.020, notes: "ضعف تنسيق بعض الجبهات" },
];

interface ContractorTemplate {
    name: string;
    scope: string;
    sharePct: number;
}

const CONTRACTOR_TEMPLATES: ContractorTemplate[] = [
    { name: "شركة البنيان المتقدم", scope: "الأعمال الإنشائية والهيكلية", sharePct: 0.37 },
    { name: "شركة الإتقان للتشطيبات", scope: "الأعمال المعمارية والتشطيبات", sharePct: 0.30 },
    { name: "شركة الأنظمة المتكاملة", scope: "الأعمال الكهروميكانيكية", sharePct: 0.18 },
    { name: "شركة الحدائق والخدمات", scope: "الأعمال الخارجية واللاندسكيب", sharePct: 0.10 },
];

const CHANGE_ORDER_TEMPLATES: { description: string; reason: string; affectedItem: string; notes: string }[] = [
    { description: "تعزيز الأسوار والبوابات", reason: "متطلبات تسويقية", affectedItem: "الأسوار والبوابات", notes: "أضاف قيمة بيعية" },
    { description: "تعديل مخارج كهربائية إضافية", reason: "ملاحظات العملاء على النموذج", affectedItem: "الكهرباء", notes: "تأثير محدود" },
    { description: "زيادة طبقات عزل في مناطق مختارة", reason: "معالجة مخاطر رطوبة", affectedItem: "العزل", notes: "منع تكلفة مستقبلية أعلى" },
    { description: "تحسينات لاندسكيب أمامي", reason: "قرار تسويقي", affectedItem: "اللاندسكيب", notes: "يعزز التسعير" },
    { description: "إعادة تصميم غرف خدمات لعدد محدود من الوحدات", reason: "تنسيق MEP/معماري", affectedItem: "التشطيبات/MEP", notes: "خفض تعارضات لاحقة" },
];

const RISK_TEMPLATES: { risk: string; response: string; owner: string; notes: string }[] = [
    { risk: "ارتفاع أسعار المواد الأساسية", response: "شراء مجمّع وتثبيت أسعار جزئي", owner: "الإدارة التعاقدية", notes: "تم تخفيف جزء من الأثر" },
    { risk: "تباطؤ التحصيلات البيعية", response: "تعزيز التحصيل وخطط سداد", owner: "الإدارة التجارية", notes: "الخطر الأهم تجاريًا" },
    { risk: "زيادة إعادة العمل في التشطيبات", response: "تفتيش إضافي واعتمادات مسبقة", owner: "الجودة/الموقع", notes: "قابل للخفض" },
    { risk: "تأخر مورد رئيسي", response: "بدائل موردين ومخزون أمان", owner: "المشتريات", notes: "تحت السيطرة" },
    { risk: "طلبات تخصيص وتعديل من العملاء", response: "تسعير التعديل واعتماد مبكر", owner: "الإدارة التجارية", notes: "قد تضيف ربحًا إن أُديرت جيدًا" },
];

// ── Generator ──────────────────────────────────────────────────────────────

const cache = new Map<string, CostData>();

export function getProjectCostData(project: ProjectInterface): CostData {
    // Project "1" is the real 120-villa compound — its data is the verbatim
    // Excel content rather than the seeded simulator output.
    if (project.id === "1") return project1CostData;

    const cached = cache.get(project.id);
    if (cached) return cached;
    const data = generateCostData(project);
    cache.set(project.id, data);
    return data;
}

function generateCostData(project: ProjectInterface): CostData {
    const rand = seededRandom(hashStringSeed(`cost-${project.id}`));
    const bias = project.cost / 100; // 0..1, higher = healthier project
    const stress = 1 - bias; // 0..1, higher = more variance/waste

    // ── Project-level financial parameters ────────────────────────────────
    const unitCount = project.unitCount;
    // Average unit price varies by project type — base around 250k USD
    const avgUnitPriceUsd = 200_000 + Math.floor(rand() * 200_000);
    const contractedRevenue = avgUnitPriceUsd * unitCount;
    // Original budget = ~73-78% of revenue (target ~24-27% margin)
    const budgetMarginShare = 0.73 + rand() * 0.05;
    const originalBudget = Math.round(contractedRevenue * budgetMarginShare);
    const plannedGrossProfit = contractedRevenue - originalBudget;

    // EAC variance: stress * 12% over budget
    const eacVariancePct = stress * 0.12;
    const eac = Math.round(originalBudget * (1 + eacVariancePct));
    const expectedFinalProfit = contractedRevenue - eac;
    const expectedMargin = expectedFinalProfit / contractedRevenue;

    // Completion progress — pick from project status hint
    const completionPct =
        project.status === "completed" ? 0.95 + rand() * 0.04
            : project.status === "early-stage" ? 0.15 + rand() * 0.20
                : project.status === "delayed" ? 0.55 + rand() * 0.20
                    : 0.50 + rand() * 0.30;

    const actualSpendToDate = Math.round(eac * completionPct);
    const collectionRate = 0.55 + rand() * 0.20 - stress * 0.08;
    const revenueRecognizedToDate = Math.round(contractedRevenue * Math.max(0.20, collectionRate));

    // ── Inputs sheet ──────────────────────────────────────────────────────
    const inputs: CostInputItem[] = [
        { category: "بيانات المشروع", label: `عدد ${project.unitType}`, value: unitCount, unit: project.unitType, note: "ثابت ومطابق", source: "قرار المشروع", inputType: "مدخل" },
        { category: "بيانات المشروع", label: "نسبة الإنجاز الحالية", value: completionPct, unit: "نسبة", note: "مطابقة للوضع التنفيذي", source: "تقدم التنفيذ", inputType: "مدخل" },
        { category: "البيع", label: `متوسط سعر بيع ${project.unitType}`, value: avgUnitPriceUsd, unit: "دولار", note: "متوسط سعري للمشروع", source: "تسعير المشروع", inputType: "مدخل" },
        { category: "البيع", label: "إجمالي الإيرادات التعاقدية", value: contractedRevenue, unit: "دولار", note: `${unitCount} × ${avgUnitPriceUsd.toLocaleString("ar-EG")}`, source: "حساب مباشر", inputType: "ناتج" },
        { category: "البيع", label: "نسبة البيع المحققة", value: collectionRate, unit: "نسبة", note: "تحصيلات تعاقدية", source: "إدارة المبيعات", inputType: "مدخل" },
        { category: "التكلفة", label: "الميزانية الأصلية المعتمدة", value: originalBudget, unit: "دولار", note: "مرجع المشروع", source: "الاعتماد المالي", inputType: "مدخل" },
        { category: "التكلفة", label: "احتياطي المخاطر", value: Math.round(originalBudget * 0.045), unit: "دولار", note: "ضمن الميزانية", source: "الإدارة المالية", inputType: "مدخل" },
        { category: "التكلفة", label: "التكلفة المتوقعة عند الإنجاز", value: eac, unit: "دولار", note: "إعادة التقدير الحالية", source: "إدارة المشروع", inputType: "ناتج" },
        { category: "التكلفة", label: "الانحراف عن الميزانية", value: eac - originalBudget, unit: "دولار", note: "EAC - الميزانية الأصلية", source: "حساب مباشر", inputType: "ناتج" },
    ];

    // ── Cost structure ────────────────────────────────────────────────────
    const structure: CostStructureItem[] = COST_CATEGORIES.map((cat) => {
        const original = Math.round(originalBudget * cat.sharePct);
        // Per-category variance varies around the project-level average
        const catVariancePct = eacVariancePct * (0.5 + rand());
        const reestimated = Math.round(original * (1 + catVariancePct));
        // Spend ratio varies — earlier categories more complete than later ones
        const idx = COST_CATEGORIES.indexOf(cat);
        const phaseFactor = 1 - idx / (COST_CATEGORIES.length * 1.2);
        const spendPct = Math.min(1, Math.max(0.3, completionPct * (0.7 + phaseFactor * 0.6)));
        const actualToDate = Math.round(reestimated * spendPct);
        return {
            level1: cat.level1,
            level2: cat.level2,
            originalBudget: original,
            reestimated,
            actualToDate,
            variance: reestimated - original,
            variancePct: catVariancePct,
            spendPct,
            sharePct: cat.sharePct,
            notes: cat.notes,
        };
    });

    // ── Cash flow ─────────────────────────────────────────────────────────
    // Generate ~24 months of cash flow centered around project's start date
    const cashFlow: CashFlowMonth[] = [];
    const startDate = new Date(project.startDate);
    const totalMonths = 24;
    let cumNet = 0;
    let cumSpend = 0;
    let cumRevenue = 0;
    const monthlyPlannedAvg = eac / totalMonths;
    const monthlyRevAvg = contractedRevenue / totalMonths;
    const today = new Date("2026-04-10");
    for (let m = 0; m < totalMonths; m++) {
        const monthDate = new Date(startDate);
        monthDate.setMonth(startDate.getMonth() + m);
        const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
        // Spend curve: ramp up then ramp down (S-curve approximation)
        const t = m / (totalMonths - 1);
        const sCurve = Math.pow(Math.sin(t * Math.PI), 0.7);
        const planned = Math.round(monthlyPlannedAvg * sCurve * 2.2);
        // Actual = planned ± stress noise
        const actualNoise = (rand() - 0.5) * 2 * stress * 0.15;
        const actual = Math.round(planned * (1 + actualNoise));
        // Revenue ramps up after first 3 months
        const revStart = Math.max(0, m - 3);
        const revShare = (revStart / (totalMonths - 4)) * 1.6;
        const revenue = Math.round(monthlyRevAvg * Math.min(1.8, revShare));
        const net = revenue - actual;
        cumNet += net;
        cumSpend += actual;
        cumRevenue += revenue;

        const isPast = monthDate < today;
        const isCurrent = monthDate.getMonth() === today.getMonth() && monthDate.getFullYear() === today.getFullYear();

        cashFlow.push({
            month: monthStr,
            plannedSpend: planned,
            actualSpend: actual,
            revenueCollected: revenue,
            netMonthly: net,
            netCumulative: cumNet,
            spendPctCum: Math.min(1, cumSpend / eac),
            collectionPctCum: Math.min(1, cumRevenue / contractedRevenue),
            notes: isPast ? "مصروفات فعلية" : isCurrent ? "الشهر الحالي" : "خطة مستقبلية",
            status: isPast ? "منقضي" : isCurrent ? "حالي" : "مستقبلي",
        });
    }

    // ── Profitability ─────────────────────────────────────────────────────
    // Distribute units by status from project-level hint
    const completedShare = project.status === "completed" ? 0.85
        : project.status === "early-stage" ? 0.10
            : project.status === "delayed" ? 0.30 : 0.25;
    const earlyShare = project.status === "early-stage" ? 0.50
        : project.status === "completed" ? 0.05 : 0.30;

    const completedCount = Math.max(0, Math.round(unitCount * completedShare));
    const earlyCount = Math.max(0, Math.round(unitCount * earlyShare));
    const inProgressCount = Math.max(0, unitCount - completedCount - earlyCount);

    const completedRev = completedCount * avgUnitPriceUsd;
    const completedCost = Math.round(completedRev * (1 - expectedMargin) * 0.96);
    const inProgRev = inProgressCount * avgUnitPriceUsd;
    const inProgCost = Math.round(inProgRev * (1 - expectedMargin) * 1.02);
    const earlyRev = earlyCount * avgUnitPriceUsd;
    const earlyCost = Math.round(earlyRev * (1 - expectedMargin) * 1.05);

    const wasteAvgPct = 0.018 + stress * 0.04;
    const reworkCostUsd = Math.round(eac * (0.005 + stress * 0.02));

    const sensitiveIndicators: SensitiveIndicator[] = [
        {
            name: "هامش الربح المتوقع",
            value: expectedMargin,
            unit: "نسبة",
            formula: "الربح المتوقع ÷ الإيرادات",
            reading: expectedMargin >= 0.25 ? "أعلى من 25%" : expectedMargin >= 0.18 ? "ضمن النطاق" : "تحت المستهدف",
            status: expectedMargin >= 0.25 ? "جيد" : expectedMargin >= 0.18 ? "مقبول" : expectedMargin >= 0.10 ? "تحذير" : "حرج",
            recommendation: expectedMargin >= 0.25 ? "الحفاظ على ضبط الهدر" : "مراجعة بنود التشطيبات",
        },
        {
            name: "نسبة الانحراف عن الميزانية",
            value: eacVariancePct,
            unit: "نسبة",
            formula: "(EAC - الميزانية) ÷ الميزانية",
            reading: eacVariancePct <= 0.02 ? "ضئيل" : eacVariancePct <= 0.05 ? "محدود" : "مرتفع",
            status: eacVariancePct <= 0.02 ? "جيد" : eacVariancePct <= 0.05 ? "مقبول" : eacVariancePct <= 0.10 ? "تحذير" : "حرج",
            recommendation: eacVariancePct <= 0.05 ? "متابعة الوضع الحالي" : "خطة تصحيح فورية",
        },
        {
            name: "نسبة الهدر الفعلية",
            value: wasteAvgPct,
            unit: "نسبة",
            formula: "متوسط هدر البنود",
            reading: wasteAvgPct <= 0.03 ? "ضمن المستهدف" : "أعلى من المستهدف",
            status: wasteAvgPct <= 0.025 ? "جيد" : wasteAvgPct <= 0.04 ? "مقبول" : "تحذير",
            recommendation: "ضبط الصرف والمناولة",
        },
        {
            name: "نسبة التحصيل التراكمية",
            value: collectionRate,
            unit: "نسبة",
            formula: "الإيرادات المحصلة ÷ الإيرادات التعاقدية",
            reading: collectionRate >= 0.7 ? "متقدم" : "تحت المستهدف",
            status: collectionRate >= 0.7 ? "جيد" : collectionRate >= 0.55 ? "مقبول" : "تحذير",
            recommendation: "تعزيز التحصيل التجاري",
        },
    ];

    const profitability: ProfitabilityData = {
        contractedRevenue,
        originalBudget,
        plannedGrossProfit,
        recognizedRevenue: revenueRecognizedToDate,
        actualCostToDate: actualSpendToDate,
        realizedProfit: revenueRecognizedToDate - actualSpendToDate,
        eac,
        expectedFinalProfit,
        expectedMargin,
        avgUnitPrice: avgUnitPriceUsd,
        avgFinalCostPerUnit: Math.round(eac / unitCount),
        avgProfitPerUnit: Math.round(expectedFinalProfit / unitCount),
        completedUnits: { count: completedCount, revenue: completedRev, cost: completedCost, profit: completedRev - completedCost },
        inProgressUnits: { count: inProgressCount, revenue: inProgRev, cost: inProgCost, profit: inProgRev - inProgCost },
        earlyUnits: { count: earlyCount, revenue: earlyRev, cost: earlyCost, profit: earlyRev - earlyCost },
        sensitiveIndicators,
    };

    // ── Waste ─────────────────────────────────────────────────────────────
    const totalMaterialBudget = originalBudget * 0.55;
    const waste: WasteItem[] = WASTE_TEMPLATES.map((w) => {
        // Quantity proportional to share / unit price
        const itemBudget = totalMaterialBudget * w.sharePct;
        const plannedQty = Math.round(itemBudget / w.unitPriceUsd);
        const wastePctActual = w.targetWastePct + stress * 0.025 + (rand() - 0.5) * 0.012;
        const wasteQty = Math.round(plannedQty * wastePctActual);
        const consumedQty = plannedQty + wasteQty;
        return {
            resource: w.resource,
            unit: w.unit,
            plannedQty,
            consumedQty,
            wasteQty,
            wastePct: Math.max(0, wastePctActual),
            unitPrice: w.unitPriceUsd,
            wasteCost: Math.round(wasteQty * w.unitPriceUsd),
            targetWastePct: w.targetWastePct,
            notes: w.notes,
        };
    });

    // ── Contractors ───────────────────────────────────────────────────────
    const contractors: CostContractorItem[] = CONTRACTOR_TEMPLATES.map((c) => {
        const contractValue = Math.round(eac * c.sharePct);
        const spentToDate = Math.round(contractValue * (completionPct * (0.85 + rand() * 0.25)));
        const cEacVariance = (rand() - 0.3) * 0.04 + stress * 0.03;
        const cEac = Math.round(contractValue * (1 + cEacVariance));
        return {
            name: c.name,
            scope: c.scope,
            contractValue,
            spentToDate,
            eac: cEac,
            contractVariance: cEac - contractValue,
            wastePct: 0.020 + rand() * 0.025 + stress * 0.015,
            reworkCost: Math.round(reworkCostUsd * c.sharePct * (0.8 + rand() * 0.6)),
            qualityScore: Math.max(60, Math.round(95 - stress * 30 - rand() * 10)),
            notes: stress > 0.5 ? "بحاجة لإحكام الرقابة" : "أداء مستقر",
        };
    });

    // ── Change orders ─────────────────────────────────────────────────────
    const changeOrderCount = Math.min(CHANGE_ORDER_TEMPLATES.length, 3 + Math.floor(stress * 4 + rand() * 2));
    const statuses: ChangeOrder["status"][] = ["معتمد", "قيد التنفيذ", "منجز", "معتمد", "قيد التنفيذ"];
    const changeOrders: ChangeOrder[] = [];
    for (let i = 0; i < changeOrderCount; i++) {
        const tpl = CHANGE_ORDER_TEMPLATES[i % CHANGE_ORDER_TEMPLATES.length];
        const value = Math.round(40_000 + rand() * 80_000 + stress * 60_000);
        changeOrders.push({
            id: String(i + 1),
            description: tpl.description,
            reason: tpl.reason,
            value,
            timeImpactDays: Math.round(2 + rand() * 8 + stress * 6),
            status: statuses[i % statuses.length],
            approver: i % 2 === 0 ? "الإدارة العليا" : "إدارة المشروع",
            affectedItem: tpl.affectedItem,
            notes: tpl.notes,
        });
    }

    // ── Risks ─────────────────────────────────────────────────────────────
    const risks: CostRiskItem[] = RISK_TEMPLATES.map((r, i) => {
        const probability = 0.20 + rand() * 0.30 + stress * 0.15;
        const impact = 0.35 + rand() * 0.30 + stress * 0.20;
        const exposure = Math.round((100_000 + rand() * 350_000) * (0.6 + stress * 0.8));
        return {
            risk: r.risk,
            probability: Math.min(0.95, probability),
            impact: Math.min(0.95, impact),
            exposure,
            response: r.response,
            owner: r.owner,
            status: i === 3 ? "مخفف" : "قائم",
            remainingExposure: Math.round(exposure * (0.4 + rand() * 0.4)),
            notes: r.notes,
        };
    });

    // ── Units (per-villa table) ───────────────────────────────────────────
    const models = [
        { name: "نموذج أ", area: 380, basePriceUsd: avgUnitPriceUsd * 0.9 },
        { name: "نموذج ب", area: 420, basePriceUsd: avgUnitPriceUsd },
        { name: "نموذج ج", area: 460, basePriceUsd: avgUnitPriceUsd * 1.12 },
    ];
    const units: UnitCostItem[] = [];
    for (let i = 0; i < unitCount; i++) {
        const isCompleted = i < completedCount;
        const isInProgress = !isCompleted && i < completedCount + inProgressCount;
        const status: UnitCostItem["status"] = isCompleted ? "مكتملة" : isInProgress ? "تحت التنفيذ" : "مرحلة مبكرة";
        const progress = isCompleted ? 1 : isInProgress ? 0.30 + rand() * 0.55 : 0.05 + rand() * 0.20;
        const model = models[i % 3];
        const planned = Math.round(model.basePriceUsd * 0.72);
        const eacUnit = Math.round(planned * (1 + eacVariancePct + (rand() - 0.5) * 0.02));
        const actual = Math.round(eacUnit * progress);
        const sale = Math.round(model.basePriceUsd);
        const revRec = isCompleted ? sale : Math.round(sale * Math.min(1, progress * 1.1));
        const expProfit = sale - eacUnit;
        units.push({
            unitNumber: i + 1,
            model: model.name,
            area: model.area,
            status,
            progressPct: progress,
            plannedBudget: planned,
            actualToDate: actual,
            eac: eacUnit,
            salePrice: sale,
            revenueRecognized: revRec,
            expectedProfit: expProfit,
            openIssues: Math.floor(rand() * 5),
            reworkCost: Math.round(reworkCostUsd / unitCount * (0.5 + rand() * 1.2)),
            estimatedWasteCost: Math.round(planned * wasteAvgPct * (0.6 + rand() * 0.8)),
        });
    }

    // ── Executive summary ────────────────────────────────────────────────
    const summary: ExecSummaryItem[] = [
        {
            axis: "الربحية",
            indicator: "هامش الربح المتوقع",
            value: expectedMargin,
            unit: "نسبة",
            target: 0.24,
            gap: expectedMargin - 0.24,
            status: expectedMargin >= 0.25 ? "إيجابي" : expectedMargin >= 0.18 ? "مقبول" : expectedMargin >= 0.10 ? "متوسط" : "تحذير",
            recommendation: expectedMargin >= 0.24 ? "الحفاظ على التسعير الحالي" : "مراجعة البنود الأعلى تكلفة",
        },
        {
            axis: "التكلفة",
            indicator: "الانحراف عن الميزانية",
            value: eac - originalBudget,
            unit: "دولار",
            target: 0,
            gap: eac - originalBudget,
            status: eacVariancePct <= 0.02 ? "إيجابي" : eacVariancePct <= 0.05 ? "متوسط" : "تحذير",
            recommendation: "التركيز على التشطيبات والهدر",
        },
        {
            axis: "الجودة",
            indicator: "تكلفة إعادة العمل",
            value: reworkCostUsd,
            unit: "دولار",
            target: Math.round(eac * 0.01),
            gap: reworkCostUsd - Math.round(eac * 0.01),
            status: reworkCostUsd <= eac * 0.01 ? "إيجابي" : reworkCostUsd <= eac * 0.02 ? "مقبول" : "تحذير",
            recommendation: "خطة علاج موقعي أسبوعية",
        },
        {
            axis: "الهدر",
            indicator: "نسبة الهدر الفعلية",
            value: wasteAvgPct,
            unit: "نسبة",
            target: 0.025,
            gap: wasteAvgPct - 0.025,
            status: wasteAvgPct <= 0.025 ? "إيجابي" : wasteAvgPct <= 0.04 ? "متوسط" : "تحذير",
            recommendation: "ضبط الصرف والمناولة",
        },
        {
            axis: "التنفيذ",
            indicator: "نسبة الإنجاز الحالية",
            value: completionPct,
            unit: "نسبة",
            target: completionPct,
            gap: 0,
            status: "مطابق",
            recommendation: "استمرار المتابعة الحالية",
        },
        {
            axis: "السيولة",
            indicator: "نسبة التحصيل / الصرف",
            value: revenueRecognizedToDate / Math.max(actualSpendToDate, 1),
            unit: "نسبة",
            target: 0.95,
            gap: revenueRecognizedToDate / Math.max(actualSpendToDate, 1) - 0.95,
            status: revenueRecognizedToDate >= actualSpendToDate * 0.95 ? "إيجابي" : "تحذير",
            recommendation: "تعزيز التحصيل التجاري",
        },
    ];

    // ── Dashboard rollup ─────────────────────────────────────────────────
    const dashboard: CostDashboardData = {
        contractedRevenue,
        originalBudget,
        eac,
        expectedFinalProfit,
        expectedMargin,
        actualSpendToDate,
        revenueRecognizedToDate,
        completionPct,
        actualWastePct: wasteAvgPct,
        reworkCost: reworkCostUsd,
        completedUnits: completedCount,
        inProgressUnits: inProgressCount,
        earlyUnits: earlyCount,
        cashFlowSparkline: cashFlow.map((m) => m.netCumulative),
        statusBreakdown: [
            { status: "مكتملة", count: completedCount, expectedCost: completedCost, expectedRevenue: completedRev },
            { status: "تحت التنفيذ", count: inProgressCount, expectedCost: inProgCost, expectedRevenue: inProgRev },
            { status: "مرحلة مبكرة", count: earlyCount, expectedCost: earlyCost, expectedRevenue: earlyRev },
        ],
    };

    // ── Compute rolled-up score for dev verification ─────────────────────
    const varianceScore = Math.max(0, 100 - eacVariancePct * 500);
    const wasteScore = Math.max(0, 100 - wasteAvgPct * 1000);
    const marginScore = Math.min(100, expectedMargin * 333);
    const rolledUpScore = Math.round((varianceScore + wasteScore + marginScore) / 3);

    return {
        inputs,
        structure,
        cashFlow,
        profitability,
        waste,
        contractors,
        changeOrders,
        risks,
        units,
        summary,
        dashboard,
        rolledUpScore,
    };
}
