import type { MemberInsightsInterface } from "@/interfaces";
import { seedMembers } from "./members";

// Deterministic pseudo-random number generator (mulberry32)
function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s |= 0;
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const INTRODUCTION =
    "لقد قامت الشركة بإنشاء نظام لتقييم الأداء يهدف إلى رفع الإنتاجية وتطوير أداء الموظفين. المديرون مسئولون عن ضمان مراجعة وتسجيل تقييم أداء الموظف. إن تقييم الأداء من أفضل وسائل الإتصال التي تساعد على إعطاء أفضل النتائج من خلال: زيادة وضوح الأدوار الوظيفية وتطوير الأداء إلى الأفضل، التدريب والتطوير، التعويضات والمكافآت، التخطيط الوظيفي والترقيات.";

const KPI_DEFINITIONS = [
    { kpiName: "معدل المتابعات الدورية", formula: "عدد المتابعات الفعلية / عدد المتابعات المستهدفة", weight: 0.10, targetBase: 100 },
    { kpiName: "معدل تنفيذ الأنشطة والزيارات", formula: "عدد الأنشطة المنفذة / عدد الأنشطة المخططة", weight: 0.20, targetBase: 100 },
    { kpiName: "معدل الزيارات", formula: "عدد الزيارات الفعلية / عدد الزيارات المستهدفة", weight: 0.10, targetBase: 100 },
    { kpiName: "معدل العقود", formula: "عدد العقود المنجزة / عدد العقود المستهدفة", weight: 0.05, targetBase: 50 },
    { kpiName: "معدل العقود للزيارات", formula: "عدد العقود / عدد الزيارات", weight: 0.10, targetBase: 100 },
    { kpiName: "نسبة التارجت المحقق بالجنيه", formula: "المبلغ المحقق / المبلغ المستهدف", weight: 0.40, targetBase: 100 },
    { kpiName: "معدل التقارير الدورية", formula: "عدد التقارير المسلمة / عدد التقارير المطلوبة", weight: 0.05, targetBase: 100 },
];

const CORE_COMPETENCIES_TEMPLATE = [
    {
        name: "التواصل و التعاون",
        definition: "القدرة على التواصل الفعال والعمل بروح الفريق لتحقيق الأهداف المشتركة",
        levels: [
            { level: 1, description: "يظهر الإهتمام بالأخرين و يستمع لهم بحيادية دون مقاطعة. يتواصل بوضوح ويتبادل المعلومات" },
            { level: 2, description: "يطلب مشاركة الأخرين ويشاورهم و يبادر بالتواصل مع الأخرين" },
            { level: 3, description: "يأخذ أراء الأخرين في الإعتبار عندما يتواصل أو يتفاوض أو يعرض أفكاره" },
            { level: 4, description: "يقوم بتوصيل المعلومات الخاصة بمواضيع وقضايا معقدة بطريقة واضحة" },
            { level: 5, description: "يتواصل لتحقيق أهداف محددة ويأخذ في عين الإعتبار جوانب متعددة" },
        ],
    },
    {
        name: "المثابرة وتحقيق الانجازات",
        definition: "الالتزام بتحقيق الأهداف والمثابرة في مواجهة التحديات",
        levels: [
            { level: 1, description: "يعي دوره ومسئولياته تجاه نتائج عمله ويقوم بتنفيذ الأعمال الموكلة إليه" },
            { level: 2, description: "دائما يعمل على إنجاز مهامه وأهدافه بغض النظر عن الصعاب" },
            { level: 3, description: "يبدي حس الملكية لأهداف الفريق ككل وليس أهدافه فقط" },
            { level: 4, description: "يلتزم بتحقيق أهدافه وأهداف الفريق من خلال نجاح الشركة ككل" },
            { level: 5, description: "يعمل بالتنسيق مع باقي الإدارات من أجل تحقيق أهداف الشركة ككل" },
        ],
    },
    {
        name: "الاهتمام بالعميل",
        definition: "الاهتمام بتلبية احتياجات العملاء وبناء علاقات مستدامة معهم",
        levels: [
            { level: 1, description: "يفهم أهمية العميل بالنسبة للشركة" },
            { level: 2, description: "يلتزم ويهتم بشؤون العميل ويحدد متطلبات العميل وتوقعاته" },
            { level: 3, description: "يبني ثقة ورابطة مع العميل ويلتزم بالوعود للعميل" },
            { level: 4, description: "يراقب ويعمل على مقاييس لإرضاء العميل ويتناول شكاوى العميل بجدية" },
            { level: 5, description: "ينمي نظم لتقييم وزيادة رضا العميل ويبني خطط لعلاقات العملاء" },
        ],
    },
];

const COMPETENCY_LABELS = ["ضعيف", "مقبول", "جيد", "جيد جداً", "ممتاز"];

const EXCELLENT_EVIDENCE_POOL = [
    "يتميز بقدرته على إنجاز المهام في الوقت المحدد مع الحفاظ على جودة العمل العالية، ويظهر التزاماً واضحاً بأهداف الفريق",
    "يبذل جهداً استثنائياً في التواصل مع العملاء وبناء علاقات مهنية قوية تساهم في تحقيق أهداف الشركة",
    "يتمتع بمهارات قيادية واضحة ويساهم في تطوير أداء زملائه من خلال تبادل الخبرات والمعرفة",
    "يظهر مبادرة مستمرة في تحسين العمليات وتقديم حلول مبتكرة للتحديات التي تواجه الفريق",
    "ملتزم بالسياسات المالية والإدارية ويحرص على تقديم التقارير الدورية بدقة وفي مواعيدها",
    "يتميز بقدرته على العمل تحت الضغط وتحقيق الأهداف المطلوبة حتى في الظروف الصعبة",
    "يحرص على تطوير مهاراته باستمرار ويتابع أحدث التطورات في مجال عمله",
];

const WEAK_EVIDENCE_POOL = [
    "يحتاج إلى تحسين مهارات إدارة الوقت وتحديد الأولويات لضمان إنجاز المهام في مواعيدها",
    "يجب العمل على تطوير مهارات التواصل مع الفريق والعملاء لتحقيق نتائج أفضل",
    "يلزم تحسين الالتزام بتقديم التقارير الدورية في المواعيد المحددة وبالجودة المطلوبة",
    "يحتاج إلى بذل مزيد من الجهد في تحقيق الأهداف البيعية المحددة وزيادة معدل الزيارات",
    "يجب تحسين مستوى المتابعة الدورية مع العملاء وتوثيق نتائج الزيارات بشكل أفضل",
    "يحتاج إلى تطوير مهاراته في التخطيط المسبق للأنشطة وتنظيم أولويات العمل",
    "يلزم تعزيز التنسيق مع باقي الإدارات لتحقيق الأهداف المشتركة بكفاءة أعلى",
];

const SUGGESTION_POOL = [
    "التركيز على التدريب المستمر وتطوير المهارات المهنية من خلال ورش العمل والدورات التدريبية",
    "وضع أهداف واضحة وقابلة للقياس مع متابعة دورية لمستوى التقدم",
    "تعزيز التواصل مع الفريق وتبادل الخبرات لرفع مستوى الأداء العام",
    "الالتزام بنظام المتابعات الدورية وتقديم التقارير في مواعيدها المحددة",
    "العمل على زيادة معدل الزيارات الميدانية وتحسين نسبة تحويل الزيارات إلى عقود",
];

function getRating(percentage: number): string {
    if (percentage >= 100) return "مميز وكفء";
    if (percentage >= 90) return "فعال";
    if (percentage >= 80) return "جيد";
    if (percentage >= 70) return "مقبول";
    if (percentage >= 60) return "غير مرض";
    return "ضعيف";
}

function generateInsights(): MemberInsightsInterface[] {
    const insights: MemberInsightsInterface[] = [];

    for (let mi = 0; mi < seedMembers.length; mi++) {
        const member = seedMembers[mi];
        const rand = seededRandom(mi * 777 + 123);

        // Generate objectives with varied actual performance
        const objectives = KPI_DEFINITIONS.map((kpi, ki) => {
            const basePerformance = 50 + rand() * 60; // 50-110%
            const actualPerformance = Math.round(basePerformance * 10) / 10;
            const targetForPeriod = kpi.targetBase;
            const actualAmount = Math.round((actualPerformance / 100) * targetForPeriod * 10) / 10;

            return {
                id: ki + 1,
                kpiName: kpi.kpiName,
                formula: kpi.formula,
                targetForPeriod,
                relativeWeight: kpi.weight,
                actualPerformance,
                actualAmount,
                notes: actualPerformance >= 90 ? "أداء جيد" : actualPerformance >= 70 ? "يحتاج تحسين" : "أداء ضعيف",
            };
        });

        // 8th KPI - remaining weight
        const usedWeight = KPI_DEFINITIONS.reduce((sum, k) => sum + k.weight, 0);
        const remainingWeight = Math.round((1 - usedWeight) * 100) / 100;
        const lastPerf = Math.round((50 + rand() * 60) * 10) / 10;
        objectives.push({
            id: 8,
            kpiName: "معدل الالتزام بالسياسة المالية",
            formula: "عدد المخالفات المالية / إجمالي العمليات",
            targetForPeriod: 100,
            relativeWeight: remainingWeight,
            actualPerformance: lastPerf,
            actualAmount: Math.round(lastPerf),
            notes: lastPerf >= 90 ? "ملتزم" : lastPerf >= 70 ? "يحتاج متابعة" : "مخالفات متكررة",
        });

        // Calculate weighted indicators score as decimal 0.0-1.0
        const indicatorsScore = Math.round(
            objectives.reduce((sum, obj) => sum + (obj.actualPerformance / 100) * obj.relativeWeight, 0) * 1000
        ) / 1000;

        // Generate competencies with varied levels per member
        const competencies = CORE_COMPETENCIES_TEMPLATE.map((comp, ci) => {
            const selectedLevel = Math.min(5, Math.max(1, Math.floor(rand() * 5) + 1));
            const score = selectedLevel / 5;

            return {
                id: ci + 1,
                name: comp.name,
                description: comp.definition,
                levels: comp.levels.map((l) => ({
                    level: l.level,
                    label: COMPETENCY_LABELS[l.level - 1],
                    description: "", // Loaded from shared template at runtime
                })),
                selectedLevel,
                selectedLabel: COMPETENCY_LABELS[selectedLevel - 1],
                score,
            };
        });

        // Calculate competencies score as decimal 0.0-1.0
        const competenciesScore = Math.round(
            (competencies.reduce((sum, c) => sum + c.score, 0) / competencies.length) * 1000
        ) / 1000;

        // Administrative score as decimal 0.0-1.0 (varied: 0.55-0.98)
        const administrativeScore = Math.round((0.55 + rand() * 0.43) * 1000) / 1000;

        // Overall performance calculation
        const competenciesWeight = 0.2;
        const indicatorsWeight = 0.7;
        const administrativeWeight = 0.1;

        // totalPercentage in 0-100 range for direct display
        const totalPercentage = Math.round(
            (competenciesScore * competenciesWeight +
                indicatorsScore * indicatorsWeight +
                administrativeScore * administrativeWeight) * 100 * 10
        ) / 10;

        const rating = getRating(totalPercentage);

        // Pick evidence texts deterministically
        const excellentIdx = Math.floor(rand() * EXCELLENT_EVIDENCE_POOL.length);
        const excellentIdx2 = Math.floor(rand() * EXCELLENT_EVIDENCE_POOL.length);
        const weakIdx = Math.floor(rand() * WEAK_EVIDENCE_POOL.length);
        const weakIdx2 = Math.floor(rand() * WEAK_EVIDENCE_POOL.length);
        const suggestionIdx = Math.floor(rand() * SUGGESTION_POOL.length);
        const suggestionIdx2 = Math.floor(rand() * SUGGESTION_POOL.length);

        const excellent = EXCELLENT_EVIDENCE_POOL[excellentIdx] +
            ". " +
            EXCELLENT_EVIDENCE_POOL[excellentIdx2 === excellentIdx ? (excellentIdx2 + 1) % EXCELLENT_EVIDENCE_POOL.length : excellentIdx2];

        const veryWeak = WEAK_EVIDENCE_POOL[weakIdx] +
            ". " +
            WEAK_EVIDENCE_POOL[weakIdx2 === weakIdx ? (weakIdx2 + 1) % WEAK_EVIDENCE_POOL.length : weakIdx2];

        const suggestions = SUGGESTION_POOL[suggestionIdx] +
            ". " +
            SUGGESTION_POOL[suggestionIdx2 === suggestionIdx ? (suggestionIdx2 + 1) % SUGGESTION_POOL.length : suggestionIdx2];

        // Determine strengths and weaknesses based on scores
        const highKpis = objectives.filter((o) => o.actualPerformance >= 85);
        const lowKpis = objectives.filter((o) => o.actualPerformance < 70);

        const strengths = highKpis.length > 0
            ? "نقاط القوة: " + highKpis.map((k) => k.kpiName).join("، ")
            : "لا توجد نقاط قوة بارزة في الفترة الحالية";

        const weaknesses = lowKpis.length > 0
            ? "نقاط الضعف: " + lowKpis.map((k) => k.kpiName).join("، ")
            : "لا توجد نقاط ضعف ملحوظة";

        insights.push({
            memberId: member.id,
            introduction: INTRODUCTION,
            evaluationPeriod: "يوليو 2019",
            department: member.subDepartmentName,
            objectives,
            competencies,
            overallPerformance: {
                competenciesWeight,
                indicatorsWeight,
                administrativeWeight,
                competenciesScore,
                indicatorsScore,
                administrativeScore,
                totalPercentage,
                rating,
                strengths,
                weaknesses,
                suggestions,
            },
            evidence: {
                excellent,
                veryWeak,
            },
            coreCompetencies: [], // Loaded from shared template at runtime
        });
    }

    return insights;
}

export const seedMemberInsights: MemberInsightsInterface[] = generateInsights();

// Shared core competencies template — used by the insights view
// Defined once here, referenced per member to avoid data duplication
export const SHARED_CORE_COMPETENCIES = CORE_COMPETENCIES_TEMPLATE.map((comp) => ({
    name: comp.name,
    definition: comp.definition,
    levels: comp.levels.map((l) => ({
        level: l.level,
        description: l.description,
    })),
}));
