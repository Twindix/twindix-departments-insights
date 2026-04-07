export interface ProjectInterface {
    id: string;
    name: string;
    description: string;
    cost: number;
    time: number;
    quality: number;
    avgPerformance: number;
    isAccessible: boolean;
}

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

// ── Arabic project name pools ──────────────────────────────────────────────

const PROJECT_BASE_NAMES = [
    "مشروع التحول الرقمي",
    "مشروع تطوير البنية التحتية",
    "مشروع إدارة الجودة الشاملة",
    "مشروع تدريب الكوادر البشرية",
    "مشروع التوسع الإقليمي",
    "مشروع تطوير خدمة العملاء",
    "مشروع الأمن السيبراني",
    "مشروع التخطيط الاستراتيجي",
    "مشروع أتمتة العمليات",
    "مشروع إعادة هيكلة سلسلة التوريد",
    "مشروع تطوير تطبيق الجوال",
    "مشروع نظام المحاسبة المتقدم",
    "مشروع تحسين بيئة العمل",
    "مشروع إدارة المخاطر",
    "مشروع الذكاء الاصطناعي",
    "مشروع التسويق الرقمي",
    "مشروع الحوكمة المؤسسية",
    "مشروع تطوير الأعمال",
    "مشروع إدارة المعرفة",
    "مشروع الاستدامة البيئية",
];

const PROJECT_DESCRIPTIONS = [
    "تحويل العمليات الورقية إلى أنظمة رقمية متكاملة لتحسين الكفاءة وتقليل الأخطاء البشرية.",
    "تحديث وتطوير البنية التحتية التقنية للشركة بما يشمل الشبكات والخوادم وأنظمة الأمان.",
    "تطبيق معايير الجودة الشاملة في جميع الأقسام لتحقيق أعلى مستويات الرضا للعملاء.",
    "برنامج تدريبي متكامل لرفع كفاءة الموظفين وتطوير مهاراتهم المهنية والقيادية.",
    "فتح فروع جديدة في المناطق الرئيسية لتوسيع نطاق خدمات الشركة وزيادة الحصة السوقية.",
    "إعادة هيكلة مركز خدمة العملاء وتبني أدوات ذكاء اصطناعي لتسريع الاستجابة.",
    "تعزيز منظومة الأمن السيبراني وحماية البيانات الحساسة من التهديدات الإلكترونية.",
    "وضع خطة استراتيجية خمسية شاملة تتضمن أهداف النمو والتطوير المؤسسي.",
    "أتمتة العمليات التشغيلية المتكررة باستخدام تقنيات الروبوتات البرمجية لتقليل التكاليف.",
    "تحسين سلسلة التوريد وتقليل فترات التسليم من خلال شراكات لوجستية جديدة.",
    "بناء تطبيق جوال متكامل للعملاء يتيح إدارة الحساب والطلبات والدعم الفني.",
    "استبدال النظام المحاسبي القديم بنظام سحابي حديث يدعم التقارير الآنية والتكامل مع الأنظمة الأخرى.",
    "تطوير بيئة العمل المادية والمعنوية لرفع مستوى رضا الموظفين وزيادة الإنتاجية.",
    "بناء إطار عمل متكامل لإدارة المخاطر المؤسسية والتشغيلية والمالية.",
    "تطبيق حلول الذكاء الاصطناعي في العمليات التشغيلية لتعزيز اتخاذ القرارات المبنية على البيانات.",
];

// ── Generate 100 projects with avg performance = 68 ────────────────────────

function generateProjects(): ProjectInterface[] {
    const rand = seededRandom(42);
    const TARGET_AVG = 68;
    const TOTAL_COUNT = 100;
    const TARGET_SUM = TARGET_AVG * TOTAL_COUNT; // 6800

    // Helper to generate a random int in [min, max]
    function randInt(min: number, max: number): number {
        return Math.floor(rand() * (max - min + 1)) + min;
    }

    // Helper to clamp
    function clamp(v: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, v));
    }

    // Generate project names with variation suffixes
    const SUFFIXES = [
        "", " - المرحلة الأولى", " - المرحلة الثانية", " - المرحلة الثالثة",
        " (تحديث)", " (توسعة)", " (تطوير)", " (إعادة هيكلة)",
    ];

    const projects: ProjectInterface[] = [];
    const usedNames = new Set<string>();

    // Generate 99 projects first, then adjust #100
    for (let i = 0; i < TOTAL_COUNT; i++) {
        // Determine performance tier for distribution:
        // ~75 high (65-95%), ~17 mixed (45-65%), ~8 low (30-44%)
        const tierRoll = rand();
        let cost: number, time: number, quality: number;

        if (tierRoll < 0.75) {
            // High tier (65-95%)
            cost = randInt(65, 95);
            time = randInt(60, 95);
            quality = randInt(60, 95);
        } else if (tierRoll < 0.92) {
            // Mixed tier (45-65%)
            cost = randInt(45, 70);
            time = randInt(40, 68);
            quality = randInt(42, 68);
        } else {
            // Low tier (<45%)
            cost = randInt(30, 50);
            time = randInt(25, 48);
            quality = randInt(35, 48);
        }

        // Generate a unique name
        let projectName: string;
        do {
            const baseName = PROJECT_BASE_NAMES[Math.floor(rand() * PROJECT_BASE_NAMES.length)];
            const suffix = SUFFIXES[Math.floor(rand() * SUFFIXES.length)];
            projectName = baseName + suffix;
        } while (usedNames.has(projectName));
        usedNames.add(projectName);

        const description = PROJECT_DESCRIPTIONS[Math.floor(rand() * PROJECT_DESCRIPTIONS.length)];
        const avgPerformance = Math.round((cost + time + quality) / 3);

        projects.push({
            id: `proj-${i + 1}`,
            name: projectName,
            description,
            cost,
            time,
            quality,
            avgPerformance,
            isAccessible: false,
        });
    }

    // Adjust the last project to hit the exact target sum of 6800
    const sumWithout = projects.slice(0, TOTAL_COUNT - 1).reduce((s, p) => s + p.avgPerformance, 0);
    const needed = TARGET_SUM - sumWithout;

    // Find cost/time/quality values where Math.round((c+t+q)/3) === needed
    // Start with even distribution, then nudge to get exact rounding
    const base = clamp(needed, 30, 98);
    let lastCost = base;
    let lastTime = clamp(base, 25, 98);
    let lastQuality = clamp(base, 35, 98);

    // Adjust to hit the exact avgPerformance
    // Math.round((c+t+q)/3) = needed  ⟹  needed*3 - 1 ≤ c+t+q ≤ needed*3 + 1
    // We need the sum to be exactly needed*3 for clean rounding
    const targetTriple = needed * 3;
    const currentTriple = lastCost + lastTime + lastQuality;
    const delta = targetTriple - currentTriple;
    // Apply delta to cost (safe within clamp range since needed is 30-98)
    lastCost = clamp(lastCost + delta, 30, 98);

    // Verify and fallback: if rounding still doesn't match, brute-force nudge
    let lastAvg = Math.round((lastCost + lastTime + lastQuality) / 3);
    if (lastAvg !== needed) {
        // Try small adjustments to quality
        for (let nudge = -3; nudge <= 3; nudge++) {
            const q = clamp(lastQuality + nudge, 35, 98);
            if (Math.round((lastCost + lastTime + q) / 3) === needed) {
                lastQuality = q;
                lastAvg = needed;
                break;
            }
        }
    }

    projects[TOTAL_COUNT - 1] = {
        ...projects[TOTAL_COUNT - 1],
        cost: lastCost,
        time: lastTime,
        quality: lastQuality,
        avgPerformance: lastAvg,
    };

    // Safety net: if still off due to edge rounding, scan all projects for one to nudge
    const finalCheck = projects.reduce((s, p) => s + p.avgPerformance, 0);
    if (finalCheck !== TARGET_SUM) {
        const diff = TARGET_SUM - finalCheck;
        for (let j = 0; j < TOTAL_COUNT - 1; j++) {
            const p = projects[j];
            for (let nudge = diff * 2; nudge <= diff * 4; nudge++) {
                const nc = clamp(p.cost + nudge, 30, 98);
                const na = Math.round((nc + p.time + p.quality) / 3);
                if (na - p.avgPerformance === diff) {
                    projects[j] = { ...p, cost: nc, avgPerformance: na };
                    break;
                }
            }
            // Re-check after potential fix
            const recheck = projects.reduce((s2, p2) => s2 + p2.avgPerformance, 0);
            if (recheck === TARGET_SUM) break;
        }
    }

    // Sort by avgPerformance descending (default sort)
    projects.sort((a, b) => b.avgPerformance - a.avgPerformance);

    return projects;
}

// 100 projects — average of all avgPerformance values = 68 (matches dashboard overallPerformance)
export const seedProjects: ProjectInterface[] = generateProjects();
