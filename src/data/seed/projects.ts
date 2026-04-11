import type { ProjectInterface, ProjectStatus, ProjectType } from "@/interfaces";
import { seededRandom } from "./prng";
import {
    PROJECT_TYPE_META,
    PROJECT_NAMES_BY_TYPE,
    SAUDI_LOCATIONS,
} from "./project-names";

// Re-export the type so existing imports from "@/data/seed" keep working.
export type { ProjectInterface } from "@/interfaces";

// ── Distribution config ────────────────────────────────────────────────────
//
// 100 projects total, distributed across 8 real-estate types.
// The score distribution targets a realistic ~65% average with wide variance:
//   ~15% excellent  (cost/time/quality 80-95)
//   ~30% good       (65-82)
//   ~35% average    (50-68)
//   ~15% weak       (35-55)
//   ~5%  critical   (22-42)
// This produces a much more diverse and realistic dashboard than the previous
// uniform 82% bias.

const TYPE_DISTRIBUTION: { type: ProjectType; count: number }[] = [
    { type: "villas-compound", count: 25 },
    { type: "residential-tower", count: 15 },
    { type: "houses", count: 12 },
    { type: "housing-compound", count: 12 },
    { type: "school", count: 12 },
    { type: "factory", count: 10 },
    { type: "mall", count: 10 },
    { type: "hospital", count: 4 },
];

type Tier = "excellent" | "good" | "average" | "weak" | "critical";

const TIER_RANGES: Record<Tier, { cost: [number, number]; time: [number, number]; quality: [number, number] }> = {
    excellent: { cost: [80, 95], time: [78, 94], quality: [82, 96] },
    good: { cost: [65, 82], time: [62, 80], quality: [68, 84] },
    average: { cost: [50, 68], time: [46, 66], quality: [52, 70] },
    weak: { cost: [35, 55], time: [32, 52], quality: [40, 58] },
    critical: { cost: [22, 42], time: [20, 38], quality: [28, 45] },
};

function pickTier(r: number): Tier {
    if (r < 0.15) return "excellent";
    if (r < 0.45) return "good";
    if (r < 0.80) return "average";
    if (r < 0.95) return "weak";
    return "critical";
}

// Today reference for status calculation. Matches the project's "current date"
// convention used elsewhere (CLAUDE.md sets the simulated current date).
const TODAY_REF = new Date("2026-04-10");

function isoDate(d: Date): string {
    return d.toISOString().split("T")[0];
}

function addDays(base: Date, days: number): Date {
    const out = new Date(base);
    out.setDate(out.getDate() + days);
    return out;
}

function deriveStatus(
    today: Date,
    startDate: Date,
    plannedEnd: Date,
    currentEnd: Date,
    delayDays: number,
): ProjectStatus {
    if (today >= currentEnd) return "completed";
    if (today < addDays(startDate, 90)) return "early-stage";
    if (delayDays > 30 || today > plannedEnd) return "delayed";
    return "in-progress";
}

// ── Generator ──────────────────────────────────────────────────────────────

function generateProjects(): ProjectInterface[] {
    const rand = seededRandom(42);

    const randInt = (min: number, max: number): number =>
        Math.floor(rand() * (max - min + 1)) + min;

    const projects: ProjectInterface[] = [];
    let projectId = 1;

    for (const { type, count } of TYPE_DISTRIBUTION) {
        const meta = PROJECT_TYPE_META[type];
        const namePool = PROJECT_NAMES_BY_TYPE[type];

        for (let j = 0; j < count; j++) {
            // ── Score tier (consumes 4 rand() calls: 1 tier + 3 ints) ─────
            const tier = pickTier(rand());
            const ranges = TIER_RANGES[tier];
            const cost = randInt(ranges.cost[0], ranges.cost[1]);
            const time = randInt(ranges.time[0], ranges.time[1]);
            const quality = randInt(ranges.quality[0], ranges.quality[1]);
            const avgPerformance = Math.round((cost + time + quality) / 3);

            // ── Name (cycles through pool, adds phase suffix on overflow) ─
            const baseName = namePool[j % namePool.length];
            const cycleIdx = Math.floor(j / namePool.length);
            const suffix = cycleIdx === 0
                ? ""
                : cycleIdx === 1
                    ? " - المرحلة الثانية"
                    : ` - المرحلة ${cycleIdx + 1}`;
            const name = baseName + suffix;

            // ── Description / longDescription (consumes 2 rand() calls) ──
            const description =
                meta.descriptions[Math.floor(rand() * meta.descriptions.length)];
            const longDescription =
                meta.longDescriptions[
                    Math.floor(rand() * meta.longDescriptions.length)
                ];

            // ── Location (1 rand() call) ──────────────────────────────────
            const location = SAUDI_LOCATIONS[Math.floor(rand() * SAUDI_LOCATIONS.length)];

            // ── Unit count (1 rand() call) ────────────────────────────────
            const [minUnits, maxUnits] = meta.unitCountRange;
            const unitCount = randInt(minUnits, maxUnits);

            // ── Contractor count (1 rand() call) ──────────────────────────
            const contractorCount = randInt(2, 6);

            // ── Dates (3 rand() calls) ────────────────────────────────────
            const startDaysAgo = randInt(60, 900);
            const startDate = addDays(TODAY_REF, -startDaysAgo);
            const plannedDurationDays = randInt(540, 1080);
            const plannedEndDate = addDays(startDate, plannedDurationDays);
            // Delay correlates with low time score
            const delayDays =
                time >= 80 ? randInt(0, 10)
                    : time >= 65 ? randInt(5, 30)
                        : time >= 50 ? randInt(15, 60)
                            : time >= 35 ? randInt(30, 110)
                                : randInt(60, 180);
            const currentEndDate = addDays(plannedEndDate, delayDays);

            const status = deriveStatus(
                TODAY_REF,
                startDate,
                plannedEndDate,
                currentEndDate,
                delayDays,
            );

            projects.push({
                id: String(projectId),
                name,
                description,
                longDescription,
                type,
                unitType: meta.unitType,
                unitCount,
                location,
                startDate: isoDate(startDate),
                plannedEndDate: isoDate(plannedEndDate),
                currentEndDate: isoDate(currentEndDate),
                status,
                contractorCount,
                cost,
                time,
                quality,
                avgPerformance,
                isAccessible: true,
            });

            projectId++;
        }
    }

    // Override project "1" with the real 120-villa compound from the Excel
    // source files. The numbers are calibrated against the Cost / Quality /
    // Timeline workbooks so the customer-facing demo reflects actual data.
    projects[0] = {
        id: "1",
        name: "مجمع الفيصل السكني — 120 فيلا",
        description: "مشروع مجمع سكني متكامل يضم 120 فيلا بثلاثة طرز معمارية، يشمل المرافق الترفيهية والخدمية الكاملة.",
        longDescription:
            "مشروع تنفيذ مجمع سكني فاخر يضم 120 فيلا موزعة على أربعة قطاعات (أ، ب، ج، د) بثلاثة نماذج معمارية مختلفة بمساحات تبدأ من 380 م² حتى 460 م². يتضمن المشروع شبكة طرق داخلية، مسطحات خضراء واسعة، نادٍ صحي مجهز، حمامات سباحة، ملاعب رياضية، مسجد، ومنطقة تجارية صغيرة لخدمة السكان. بدأ التنفيذ في يناير 2025 ومن المخطط إقفال المشروع بالكامل بنهاية أغسطس 2027 على دفعات تنفيذية متتابعة. يُدار المشروع بالشراكة مع أربعة مقاولين رئيسيين متخصصين في الأعمال الإنشائية والمعمارية والكهروميكانيكية والخارجية.",
        type: "villas-compound",
        unitType: "فيلا",
        unitCount: 120,
        location: "الرياض",
        startDate: "2025-01-05",
        plannedEndDate: "2027-01-05",
        currentEndDate: "2027-08-28",
        status: "in-progress",
        contractorCount: 4,
        // Scores derived from the Excel files:
        //   cost score 91% — variance ~1.83%, expected margin 25.32%
        //   time score 85% — avg delay 6.2 days, 65% complete
        //   quality score 96% — quality index 0.965
        cost: 91,
        time: 85,
        quality: 96,
        avgPerformance: 91,
        isAccessible: true,
    };

    // Sort by avgPerformance descending, then pin project "1" to the top so
    // the real-data showcase project is always the first card on the list.
    projects.sort((a, b) => b.avgPerformance - a.avgPerformance);
    const pinIdx = projects.findIndex((p) => p.id === "1");
    if (pinIdx > 0) {
        const [pinned] = projects.splice(pinIdx, 1);
        projects.unshift(pinned);
    }

    return projects;
}

export const seedProjects: ProjectInterface[] = generateProjects();
