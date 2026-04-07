import type { EmployeeInterface } from "@/interfaces";

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

// ── Exported female name set (used by CV seed for gender detection) ─────────
export const FEMALE_NAME_SET = new Set(FEMALE_FIRST_NAMES);

// ── Arabic to Latin transliteration for emails ─────────────────────────────

const AR_TO_EN: Record<string, string> = {
    "محمد": "mohammed", "أحمد": "ahmed", "علي": "ali", "عمر": "omar", "خالد": "khaled",
    "حسن": "hassan", "إبراهيم": "ibrahim", "يوسف": "youssef", "مصطفى": "mustafa", "طارق": "tarek",
    "سامي": "sami", "هشام": "hesham", "عبد الله": "abdullah", "كريم": "karim", "رامي": "rami",
    "أسامة": "osama", "مروان": "marwan", "إسلام": "islam", "حازم": "hazem", "تامر": "tamer",
    "وائل": "wael", "عصام": "essam", "ياسر": "yasser", "فؤاد": "fouad", "نبيل": "nabil",
    "شريف": "sherif", "جمال": "gamal", "عادل": "adel", "سعيد": "saeed", "فيصل": "faisal",
    "بلال": "bilal", "زياد": "ziad", "أنس": "anas", "باسم": "basem", "حسام": "hossam",
    "رضا": "reda", "ماجد": "maged", "سامح": "sameh", "منصور": "mansour", "عماد": "emad",
    "سارة": "sara", "نورهان": "nourhan", "هاجر": "hagar", "ياسمين": "yasmin", "دينا": "dina",
    "منى": "mona", "فاطمة": "fatma", "ريهام": "reham", "هند": "hend", "هديل": "hadeel",
    "أميرة": "amira", "رنا": "rana", "إيمان": "iman", "نهى": "noha", "عبير": "abeer",
    "بسمة": "basma", "أفنان": "afnan", "سمية": "somaya", "مريم": "mariam", "لمياء": "lamiaa",
    "داليا": "dalia", "نادية": "nadia", "هبة": "heba", "شيماء": "shimaa", "آية": "aya",
    "ندى": "nada", "رغدة": "raghda", "جهاد": "gehad", "لينا": "lina", "نورا": "noura",
    "سمير": "samir", "جمعة": "gomaa", "فهمي": "fahmy", "سعد": "saad", "محمود": "mahmoud",
    "بهاء": "bahaa", "يحيى": "yahia", "خليفة": "khalifa", "صلاح": "salah", "عفيفي": "afifi",
    "فرحات": "farhat", "حسني": "hosny", "شعبان": "shaaban", "عبد القادر": "abdelkader",
    "محسن": "mohsen", "رفعت": "refaat", "حسين": "hussein", "عبد الفتاح": "abdelfattah",
    "بيومي": "bayoumy", "النجار": "elnaggar", "الشريف": "elsherif", "فتحي": "fathy",
    "بكر": "bakr", "السيد": "elsayed", "ناصر": "nasser", "حمدي": "hamdy", "الزهراء": "elzahraa",
    "سالم": "salem", "عبد الحميد": "abdelhamid", "شوقي": "shawky", "نور": "nour",
    "حلمي": "helmy", "الدين": "eldin", "عمار": "ammar", "توفيق": "tawfik",
    "رشدي": "roshdy", "كمال": "kamal", "غنيم": "ghonaim", "مرسي": "morsy",
    "شاهين": "shaheen", "عوض": "awad", "حبيب": "habib", "عزت": "ezzat",
};

function transliterate(name: string): string {
    return AR_TO_EN[name] || name.replace(/ /g, "").toLowerCase();
}

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

export const DEPARTMENT_EMPLOYEE_COUNTS: Record<string, number> = {};
for (const cfg of DEPT_CONFIGS) {
    DEPARTMENT_EMPLOYEE_COUNTS[cfg.subDeptId] = cfg.count;
}

// ── Gender-accurate role transformation ─────────────────────────────────────

const MALE_TO_FEMALE_ROLE: [RegExp, string][] = [
    [/\bمدير\b/, "مديرة"],
    [/\bأخصائي\b/, "أخصائية"],
    [/\bمهندس\b/, "مهندسة"],
    [/\bمحلل\b/, "محللة"],
    [/\bمشرف\b/, "مشرفة"],
    [/\bمنسق\b/, "منسقة"],
    [/\bفني\b/, "فنية"],
    [/\bمسؤول\b/, "مسؤولة"],
    [/\bمخطط\b/, "مخططة"],
    [/\bمراجع\b/, "مراجعة"],
    [/\bمحاسب\b/, "محاسبة"],
    [/\bمندوب\b/, "مندوبة"],
    [/\bموظف\b/, "موظفة"],
    [/\bمصمم\b/, "مصممة"],
    [/\bمطور\b/, "مطورة"],
    [/\bأمين\b/, "أمينة"],
    [/\bسكرتير\b/, "سكرتيرة"],
    [/\bتنفيذي\b/, "تنفيذية"],
];

function feminizeRole(role: string): string {
    // Skip if already feminine (contains ة in key positions)
    if (/موظفة|مندوبة|أخصائية|مهندسة|مديرة|منسقة|مسؤولة/.test(role)) return role;
    let result = role;
    for (const [pattern, replacement] of MALE_TO_FEMALE_ROLE) {
        result = result.replace(pattern, replacement);
    }
    return result;
}

// ── Generate employees ────────────────────────────────────────────────────────

function generateEmployees(): EmployeeInterface[] {
    const employees: EmployeeInterface[] = [];
    let globalIndex = 0;

    for (const dept of DEPT_CONFIGS) {
        for (let i = 0; i < dept.count; i++) {
            const rand = seededRandom(globalIndex * 997 + 31);

            // 60% male, 40% female
            const isMale = rand() < 0.6;
            const firstNames = isMale ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;
            const firstName = firstNames[Math.floor(rand() * firstNames.length)];
            const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
            const rawRole = dept.roles[Math.floor(rand() * dept.roles.length)];
            const role = isMale ? rawRole : feminizeRole(rawRole);

            const id = `${globalIndex + 1}`;
            const name = `${firstName} ${lastName}`;

            // Transliterate Arabic names to English for email
            const email = `${transliterate(firstName)}.${transliterate(lastName)}${globalIndex + 1}@twindix.com`;

            // Avatar: first letter of first name + first letter of last name
            const avatar = `${firstName.charAt(0)}${lastName.charAt(0)}`;

            // Generate joining date: range from 15 years ago to present
            const yearsAgo = rand() * 15;
            const joiningMs = Date.now() - yearsAgo * 365.25 * 24 * 60 * 60 * 1000;
            const joiningD = new Date(joiningMs);
            const joiningDate = `${joiningD.getFullYear()}-${String(joiningD.getMonth() + 1).padStart(2, "0")}-${String(joiningD.getDate()).padStart(2, "0")}`;

            employees.push({
                id,
                name,
                email,
                role,
                avatar,
                subDepartmentId: dept.subDeptId,
                subDepartmentName: dept.subDeptName,
                joiningDate,
            });

            globalIndex++;
        }
    }

    return employees;
}

export const seedEmployees: EmployeeInterface[] = generateEmployees();
