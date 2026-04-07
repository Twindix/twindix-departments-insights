import type { MemberInterface } from "@/interfaces";

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

// ── Name pools ──────────────────────────────────────────────────────────────

const MALE_FIRST_NAMES = [
    "محمد", "أحمد", "علي", "عمر", "خالد", "حسن", "إبراهيم", "يوسف", "مصطفى", "طارق",
    "سامي", "هشام", "عبد الله", "كريم", "رامي", "أسامة", "مروان", "إسلام", "حازم", "تامر",
    "وائل", "عصام", "ياسر", "فؤاد", "نبيل", "شريف", "جمال", "عادل", "سعيد", "فيصل",
    "بلال", "زياد", "أنس", "باسم", "حسام", "رضا", "ماجد", "سامح", "منصور", "عماد",
];

const FEMALE_FIRST_NAMES = [
    "سارة", "نورهان", "هاجر", "ياسمين", "دينا", "منى", "فاطمة", "ريهام", "هند", "هديل",
    "أميرة", "رنا", "إيمان", "نهى", "عبير", "بسمة", "أفنان", "سمية", "مريم", "لمياء",
    "داليا", "نادية", "هبة", "شيماء", "آية", "ندى", "رغدة", "جهاد", "لينا", "نورا",
];

const LAST_NAMES = [
    "سمير", "جمعة", "فهمي", "سعد", "حسن", "محمد", "إبراهيم", "عزت", "سعيد", "فيصل",
    "بهاء", "يحيى", "أحمد", "خليفة", "نبيل", "صلاح", "عفيفي", "فرحات", "حسني", "عادل",
    "شعبان", "عبد القادر", "محسن", "رفعت", "حسين", "عبد الفتاح", "يوسف", "بيومي", "طارق", "النجار",
    "الشريف", "مصطفى", "فتحي", "بكر", "خالد", "السيد", "ناصر", "حمدي", "الزهراء", "سالم",
    "شريف", "عبد الحميد", "حسام", "جمال", "فؤاد", "شوقي", "نور", "حلمي", "الدين", "محمود",
    "منصور", "عمار", "توفيق", "رشدي", "كمال", "غنيم", "مرسي", "شاهين", "عوض", "حبيب",
];

// ── Department configs ──────────────────────────────────────────────────────

interface DeptConfig {
    subDeptId: string;
    subDeptName: string;
    roles: string[];
    count: number;
}

const DEPT_CONFIGS: DeptConfig[] = [
    {
        subDeptId: "dept-hr",
        subDeptName: "إدارة الموارد البشرية",
        roles: ["أخصائي موارد بشرية", "مدير توظيف", "أخصائي تدريب", "مسؤول رواتب", "أخصائي شؤون موظفين", "مدير موارد بشرية", "منسق تطوير مهني", "أخصائي علاقات عمل"],
        count: 80,
    },
    {
        subDeptId: "dept-it",
        subDeptName: "إدارة IT",
        roles: ["مطور برمجيات", "مهندس شبكات", "محلل أنظمة", "مدير تقنية المعلومات", "فني دعم تقني", "مهندس DevOps", "مصمم UX/UI"],
        count: 60,
    },
    {
        subDeptId: "dept-finance",
        subDeptName: "إدارة المالية",
        roles: ["محاسب أول", "محاسب", "مراجع مالي", "محلل مالي", "أمين صندوق", "مدير مالي"],
        count: 75,
    },
    {
        subDeptId: "dept-projects",
        subDeptName: "إدارة المشروعات",
        roles: ["مدير مشروعات", "مهندس مشروعات", "فني مشروعات", "منسق مشروعات", "مخطط مشروعات"],
        count: 90,
    },
    {
        subDeptId: "dept-customer",
        subDeptName: "إدارة خدمة العملاء",
        roles: ["مشرف خدمة عملاء", "موظف خدمة عملاء", "أخصائي شكاوى", "موظفة خدمة عملاء", "مدير خدمة العملاء"],
        count: 85,
    },
    {
        subDeptId: "dept-commercial",
        subDeptName: "إدارة القطاع التجاري",
        roles: ["مدير تجاري", "مندوب تجاري", "أخصائي عقود", "منسق تجاري", "محلل أعمال"],
        count: 70,
    },
    {
        subDeptId: "dept-marketing",
        subDeptName: "التسويق",
        roles: ["مدير تسويق", "أخصائي تسويق", "أخصائي تسويق رقمي", "مصمم جرافيك", "أخصائي محتوى", "أخصائي SEO"],
        count: 65,
    },
    {
        subDeptId: "dept-admin",
        subDeptName: "الشؤون الإدارية",
        roles: ["مدير إداري", "موظف إداري", "سكرتير تنفيذي", "موظف استقبال", "منسق إداري", "مسؤول أرشيف"],
        count: 55,
    },
    {
        subDeptId: "dept-sales",
        subDeptName: "المبيعات",
        roles: ["مدير مبيعات", "مشرف مبيعات", "مندوب مبيعات", "مندوبة مبيعات", "أخصائي مبيعات", "منسق مبيعات"],
        count: 120,
    },
];

// ── Exported counts map (used by departments.ts) ────────────────────────────

export const DEPARTMENT_MEMBER_COUNTS: Record<string, number> = {};
for (const cfg of DEPT_CONFIGS) {
    DEPARTMENT_MEMBER_COUNTS[cfg.subDeptId] = cfg.count;
}

// ── Generate members ────────────────────────────────────────────────────────

function generateMembers(): MemberInterface[] {
    const members: MemberInterface[] = [];
    let globalIndex = 0;

    for (const dept of DEPT_CONFIGS) {
        for (let i = 0; i < dept.count; i++) {
            const rand = seededRandom(globalIndex * 997 + 31);

            // 60% male, 40% female
            const isMale = rand() < 0.6;
            const firstNames = isMale ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;
            const firstName = firstNames[Math.floor(rand() * firstNames.length)];
            const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
            const role = dept.roles[Math.floor(rand() * dept.roles.length)];

            const id = `mem-${String(globalIndex + 1).padStart(4, "0")}`;
            const name = `${firstName} ${lastName}`;

            // Transliterate first characters for email (simplified)
            const email = `${firstName.replace(/ /g, "")}.${lastName.replace(/ /g, "")}${globalIndex + 1}@twindix.com`;

            // Avatar: first letter of first name + first letter of last name
            const avatar = `${firstName.charAt(0)}${lastName.charAt(0)}`;

            members.push({
                id,
                name,
                email,
                role,
                avatar,
                subDepartmentId: dept.subDeptId,
                subDepartmentName: dept.subDeptName,
            });

            globalIndex++;
        }
    }

    return members;
}

export const seedMembers: MemberInterface[] = generateMembers();
