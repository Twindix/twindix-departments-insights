import type { EmployeeCvInterface, WorkExperienceInterface, CertificationInterface, CourseInterface } from "@/interfaces";
import { seedEmployees, FEMALE_NAME_SET } from "./employees";
import { getTenureInfo } from "@/utils/tenure";

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

// ── Data Pools ─────────────────────────────────────────────────────────────

const COMPANIES = [
    "شركة النيل للتقنية",
    "مجموعة الأهرام التجارية",
    "شركة المستقبل للاستشارات",
    "شركة دلتا للبرمجيات",
    "مجموعة القاهرة المالية",
    "شركة الإسكندرية للاتصالات",
    "شركة الوادي للتجارة",
    "مجموعة النور للخدمات",
    "شركة بيراميدز للتطوير",
    "شركة الشرق الأوسط للاستثمار",
    "مجموعة المصرية للصناعات",
    "شركة الأمل للتوريدات",
    "شركة سفنكس للتكنولوجيا",
    "مجموعة الفيروز للإعلام",
    "شركة النهضة للحلول الرقمية",
];

// Experience roles mapped by department
const DEPARTMENT_EXPERIENCE_ROLES: Record<string, string[]> = {
    "dept-hr": ["أخصائي موارد بشرية", "منسق توظيف", "أخصائي شؤون موظفين", "مسؤول تدريب", "أخصائي رواتب"],
    "dept-it": ["مطور برمجيات", "فني دعم تقني", "محلل أنظمة", "مهندس شبكات", "مصمم واجهات", "مطور ويب"],
    "dept-finance": ["محاسب", "محلل مالي", "مراجع حسابات", "أمين صندوق", "أخصائي ضرائب"],
    "dept-projects": ["منسق مشروعات", "مهندس مشروعات", "مساعد مدير مشروع", "أخصائي تخطيط", "فني مشروعات"],
    "dept-customer": ["موظف خدمة عملاء", "مشرف خدمة عملاء", "أخصائي دعم فني", "مسؤول شكاوى"],
    "dept-commercial": ["منسق تجاري", "أخصائي عقود", "محلل أعمال", "مندوب تجاري", "أخصائي مشتريات"],
    "dept-marketing": ["أخصائي تسويق", "مصمم جرافيك", "كاتب محتوى", "أخصائي سوشيال ميديا", "أخصائي SEO"],
    "dept-admin": ["منسق إداري", "سكرتير", "موظف استقبال", "مسؤول أرشيف", "موظف إداري"],
    "dept-sales": ["مندوب مبيعات", "أخصائي مبيعات", "منسق مبيعات", "مشرف مبيعات مبتدئ"],
};

const DESCRIPTIONS = [
    "المسؤول عن إدارة العمليات اليومية وتنسيق المهام بين الفرق المختلفة لضمان سير العمل بكفاءة",
    "تنفيذ الخطط الاستراتيجية للقسم ومتابعة تحقيق الأهداف الربع سنوية والسنوية",
    "إعداد التقارير الدورية وتحليل البيانات لتقديم توصيات لتحسين الأداء",
    "التواصل مع العملاء وبناء علاقات مهنية قوية لتعزيز رضا العملاء وولائهم",
    "المشاركة في تطوير الأنظمة والعمليات الداخلية لرفع مستوى الإنتاجية",
    "الإشراف على فريق العمل وتوزيع المهام وتقييم الأداء بشكل دوري",
    "إدارة الميزانيات والمصروفات والتأكد من الالتزام بالسياسات المالية المعتمدة",
    "تدريب الموظفين الجدد ونقل المعرفة والخبرات لضمان جودة العمل",
];

const UNIVERSITIES = [
    "جامعة القاهرة",
    "جامعة عين شمس",
    "الجامعة الأمريكية بالقاهرة",
    "جامعة الإسكندرية",
    "جامعة حلوان",
    "جامعة المنصورة",
    "جامعة الأزهر",
    "جامعة طنطا",
    "جامعة أسيوط",
    "جامعة بنها",
];

// Education degrees mapped by department (primary + secondary options)
const DEPARTMENT_EDUCATION: Record<string, string[]> = {
    "dept-hr": ["بكالوريوس إدارة أعمال", "بكالوريوس حقوق", "بكالوريوس آداب قسم علم نفس", "بكالوريوس تجارة"],
    "dept-it": ["بكالوريوس حاسبات ومعلومات", "بكالوريوس هندسة حاسبات", "بكالوريوس علوم حاسب", "بكالوريوس هندسة اتصالات"],
    "dept-finance": ["بكالوريوس تجارة قسم محاسبة", "بكالوريوس تجارة", "بكالوريوس إدارة أعمال", "بكالوريوس اقتصاد"],
    "dept-projects": ["بكالوريوس هندسة", "بكالوريوس إدارة أعمال", "بكالوريوس هندسة صناعية", "بكالوريوس هندسة مدنية"],
    "dept-customer": ["بكالوريوس إدارة أعمال", "بكالوريوس تجارة", "بكالوريوس آداب", "بكالوريوس إعلام"],
    "dept-commercial": ["بكالوريوس تجارة", "بكالوريوس إدارة أعمال", "بكالوريوس اقتصاد", "بكالوريوس حقوق"],
    "dept-marketing": ["بكالوريوس إعلام", "بكالوريوس تسويق", "بكالوريوس فنون تطبيقية", "بكالوريوس إدارة أعمال"],
    "dept-admin": ["بكالوريوس إدارة أعمال", "بكالوريوس تجارة", "بكالوريوس آداب", "دبلوم إدارة مكاتب"],
    "dept-sales": ["بكالوريوس تجارة", "بكالوريوس إدارة أعمال", "بكالوريوس تسويق", "بكالوريوس آداب"],
};

// Generic degrees for career-shift edge cases
const GENERIC_DEGREES = ["بكالوريوس إدارة أعمال", "بكالوريوس تجارة", "بكالوريوس آداب", "بكالوريوس هندسة", "بكالوريوس حاسبات ومعلومات"];

// Skills mapped by department sub-ID
const DEPARTMENT_SKILLS: Record<string, string[]> = {
    "dept-hr": [
        "إدارة الموارد البشرية", "التوظيف", "إدارة الرواتب", "تقييم الأداء",
        "التدريب والتطوير", "قانون العمل", "إدارة المزايا", "التخطيط الوظيفي",
        "علاقات العمل", "إدارة شؤون الموظفين",
    ],
    "dept-it": [
        "البرمجة", "قواعد البيانات", "الشبكات", "أمن المعلومات",
        "تطوير تطبيقات الويب", "إدارة الخوادم", "تحليل النظم", "الحوسبة السحابية",
        "DevOps", "تصميم واجهات المستخدم",
    ],
    "dept-finance": [
        "المحاسبة المالية", "التحليل المالي", "إعداد الميزانيات", "المراجعة الداخلية",
        "التخطيط المالي", "إدارة المخاطر", "المعايير المحاسبية", "الضرائب",
        "تحليل التكاليف", "إعداد القوائم المالية",
    ],
    "dept-projects": [
        "إدارة المشروعات", "التخطيط الاستراتيجي", "إدارة المخاطر", "جدولة المشاريع",
        "إدارة الموارد", "ضمان الجودة", "إدارة العقود", "تحليل الأعمال",
        "منهجيات Agile", "إدارة أصحاب المصلحة",
    ],
    "dept-customer": [
        "خدمة العملاء", "حل المشكلات", "إدارة الشكاوى", "التواصل الفعال",
        "إدارة علاقات العملاء", "مهارات التفاوض", "العمل تحت الضغط", "إدارة الوقت",
        "الذكاء العاطفي", "مهارات الإقناع",
    ],
    "dept-commercial": [
        "إدارة العقود التجارية", "التفاوض", "تحليل الأعمال", "إدارة الشراكات",
        "التخطيط التجاري", "دراسات الجدوى", "إدارة سلسلة التوريد", "التجارة الدولية",
        "إدارة المشتريات", "تطوير الأعمال",
    ],
    "dept-marketing": [
        "التسويق الرقمي", "إدارة وسائل التواصل الاجتماعي", "تحليل البيانات التسويقية", "كتابة المحتوى",
        "تصميم الحملات الإعلانية", "SEO", "إدارة العلامة التجارية", "بحوث السوق",
        "التسويق بالمحتوى", "إدارة الفعاليات",
    ],
    "dept-admin": [
        "إدارة المكاتب", "التنسيق الإداري", "إدارة الأرشيف", "الاتصالات الإدارية",
        "تنظيم الاجتماعات", "إدارة المرافق", "السكرتارية التنفيذية", "إدارة المراسلات",
        "التخطيط اللوجستي", "خدمات الدعم الإداري",
    ],
    "dept-sales": [
        "إدارة المبيعات", "التفاوض", "خدمة العملاء", "تحقيق الأهداف البيعية",
        "بناء العلاقات", "إدارة الحسابات", "تحليل السوق", "العروض التقديمية",
        "إدارة الوقت", "مهارات الإقناع",
    ],
};

// Certifications mapped by department
const DEPARTMENT_CERTIFICATIONS: Record<string, { name: string; issuer: string }[]> = {
    "dept-hr": [
        { name: "شهادة الموارد البشرية المهنية PHR", issuer: "معهد شهادات الموارد البشرية" },
        { name: "شهادة محترف موارد بشرية أول SPHR", issuer: "معهد شهادات الموارد البشرية" },
        { name: "شهادة SHRM-CP", issuer: "جمعية إدارة الموارد البشرية" },
    ],
    "dept-it": [
        { name: "شهادة AWS Solutions Architect", issuer: "أمازون ويب سيرفيسز" },
        { name: "شهادة مدقق نظم معلومات CISA", issuer: "جمعية ISACA" },
        { name: "شهادة CompTIA Security+", issuer: "CompTIA" },
    ],
    "dept-finance": [
        { name: "شهادة محاسب إداري معتمد CMA", issuer: "معهد المحاسبين الإداريين" },
        { name: "شهادة التحليل المالي CFA", issuer: "معهد CFA" },
        { name: "شهادة المحاسب القانوني المعتمد CPA", issuer: "المعهد الأمريكي للمحاسبين" },
    ],
    "dept-projects": [
        { name: "شهادة محترف إدارة المشروعات PMP", issuer: "معهد إدارة المشروعات PMI" },
        { name: "شهادة PRINCE2 Practitioner", issuer: "Axelos" },
        { name: "شهادة Scrum Master معتمد CSM", issuer: "Scrum Alliance" },
    ],
    "dept-customer": [
        { name: "شهادة خدمة العملاء المعتمدة CCSP", issuer: "معهد خدمة العملاء" },
        { name: "شهادة إدارة تجربة العملاء CXM", issuer: "المعهد الدولي لتجربة العملاء" },
    ],
    "dept-commercial": [
        { name: "شهادة محلل أعمال معتمد CBAP", issuer: "المعهد الدولي لتحليل الأعمال" },
        { name: "شهادة إدارة سلسلة التوريد CSCP", issuer: "جمعية APICS" },
        { name: "شهادة التجارة الدولية", issuer: "غرفة التجارة الدولية" },
    ],
    "dept-marketing": [
        { name: "شهادة محترف تسويق رقمي", issuer: "أكاديمية جوجل" },
        { name: "شهادة HubSpot Inbound Marketing", issuer: "HubSpot Academy" },
        { name: "شهادة Meta Blueprint", issuer: "Meta" },
    ],
    "dept-admin": [
        { name: "شهادة إدارة المكاتب المعتمدة", issuer: "المعهد الإداري البريطاني" },
        { name: "شهادة السكرتارية التنفيذية", issuer: "أكاديمية التدريب المهني" },
    ],
    "dept-sales": [
        { name: "شهادة محترف مبيعات معتمد CPSP", issuer: "الرابطة الوطنية لمحترفي المبيعات" },
        { name: "شهادة إدارة الحسابات الاستراتيجية", issuer: "معهد المبيعات الدولي" },
    ],
};

// General certifications (for any department)
const GENERAL_CERTIFICATIONS = [
    { name: "شهادة اللغة الإنجليزية IELTS", issuer: "المجلس الثقافي البريطاني" },
    { name: "شهادة إدارة الجودة الشاملة", issuer: "المنظمة الدولية للمعايير ISO" },
    { name: "شهادة القيادة والإدارة", issuer: "معهد الإدارة العربي" },
];

// Courses mapped by department
const DEPARTMENT_COURSES: Record<string, { name: string; provider: string; duration: string }[]> = {
    "dept-hr": [
        { name: "دورة إدارة الموارد البشرية الحديثة", provider: "أكاديمية التدريب المهني", duration: "٤٠ ساعة" },
        { name: "دورة التوظيف والاستقطاب", provider: "مركز التميز للموارد البشرية", duration: "٢٥ ساعة" },
        { name: "دورة قانون العمل المصري", provider: "المعهد القانوني", duration: "٢٠ ساعة" },
    ],
    "dept-it": [
        { name: "دورة تطوير تطبيقات الويب المتقدمة", provider: "أكاديمية التقنية الحديثة", duration: "٥٠ ساعة" },
        { name: "دورة أمن المعلومات والشبكات", provider: "معهد تقنية المعلومات", duration: "٤٠ ساعة" },
        { name: "دورة الحوسبة السحابية", provider: "أكاديمية البيانات العربية", duration: "٣٠ ساعة" },
    ],
    "dept-finance": [
        { name: "دورة إعداد التقارير المالية", provider: "المعهد المصري للمحاسبين", duration: "٣٥ ساعة" },
        { name: "دورة المعايير المحاسبية الدولية", provider: "معهد المحاسبين القانونيين", duration: "٤٠ ساعة" },
        { name: "دورة التحليل المالي المتقدم", provider: "أكاديمية البيانات العربية", duration: "٣٠ ساعة" },
    ],
    "dept-projects": [
        { name: "دورة إدارة المشروعات الاحترافية", provider: "معهد إدارة المشروعات", duration: "٥٠ ساعة" },
        { name: "دورة منهجيات Agile و Scrum", provider: "أكاديمية التدريب المهني", duration: "٣٠ ساعة" },
        { name: "دورة التخطيط الاستراتيجي", provider: "مركز الاستراتيجيات العربية", duration: "٢٠ ساعة" },
    ],
    "dept-customer": [
        { name: "دورة خدمة العملاء المتميزة", provider: "مركز خدمة العملاء العربي", duration: "١٥ ساعة" },
        { name: "دورة إدارة علاقات العملاء CRM", provider: "أكاديمية التدريب المهني", duration: "٢٥ ساعة" },
        { name: "دورة مهارات التواصل الفعال", provider: "مركز التميز للتدريب", duration: "٢٠ ساعة" },
    ],
    "dept-commercial": [
        { name: "دورة مهارات التفاوض المتقدمة", provider: "معهد الإدارة العربي", duration: "٢٥ ساعة" },
        { name: "دورة إدارة العقود التجارية", provider: "المعهد القانوني", duration: "٣٠ ساعة" },
        { name: "دورة دراسات الجدوى", provider: "أكاديمية التدريب المهني", duration: "٢٠ ساعة" },
    ],
    "dept-marketing": [
        { name: "دورة التسويق الرقمي", provider: "أكاديمية جوجل", duration: "٣٠ ساعة" },
        { name: "دورة إدارة الحملات الإعلانية", provider: "أكاديمية الإعلان العربي", duration: "٢٥ ساعة" },
        { name: "دورة تحليل البيانات التسويقية", provider: "أكاديمية البيانات العربية", duration: "٣٥ ساعة" },
    ],
    "dept-admin": [
        { name: "دورة إدارة المكاتب الحديثة", provider: "أكاديمية التدريب المهني", duration: "٢٠ ساعة" },
        { name: "دورة إدارة الوقت والأولويات", provider: "مركز التميز للتدريب", duration: "٢٠ ساعة" },
        { name: "دورة مهارات السكرتارية التنفيذية", provider: "معهد الإدارة العربي", duration: "٢٥ ساعة" },
    ],
    "dept-sales": [
        { name: "دورة مهارات البيع الاحترافية", provider: "معهد المبيعات العربي", duration: "٣٠ ساعة" },
        { name: "دورة التفاوض وإغلاق الصفقات", provider: "أكاديمية التدريب المهني", duration: "٢٥ ساعة" },
        { name: "دورة إدارة العلاقات مع العملاء", provider: "مركز خدمة العملاء العربي", duration: "٢٠ ساعة" },
    ],
};

// General courses
const GENERAL_COURSES = [
    { name: "دورة القيادة والإدارة", provider: "أكاديمية التدريب المهني", duration: "٤٠ ساعة" },
    { name: "دورة الذكاء الاصطناعي للأعمال", provider: "أكاديمية التقنية الحديثة", duration: "٣٠ ساعة" },
];

const ADDRESSES = [
    "مدينة نصر، القاهرة",
    "المعادي، القاهرة",
    "الإسكندرية",
    "مصر الجديدة، القاهرة",
    "الدقي، الجيزة",
    "المهندسين، الجيزة",
    "الزمالك، القاهرة",
    "شبرا، القاهرة",
    "حلوان، القاهرة",
    "العباسية، القاهرة",
    "المنصورة، الدقهلية",
    "طنطا، الغربية",
    "الزقازيق، الشرقية",
    "أسيوط",
    "سوهاج",
];

// Female-gendered Arabic role names (containing ة suffix in the role keyword)
const FEMALE_ROLE_INDICATORS = ["موظفة", "مندوبة", "أخصائية", "مهندسة", "مديرة", "منسقة", "مسؤولة"];

// ── Helper functions ────────────────────────────────────────────────────────

function isFemaleRole(role: string): boolean {
    return FEMALE_ROLE_INDICATORS.some((indicator) => role.includes(indicator));
}

function pickFrom<T>(arr: T[], rand: () => number): T {
    return arr[Math.floor(rand() * arr.length)];
}

function pickMultiple<T>(arr: T[], count: number, rand: () => number): T[] {
    const shuffled = [...arr];
    // Fisher-Yates shuffle with seeded rand
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

function formatIsoDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function generateNationalId(rand: () => number): string {
    let id = "";
    // First digit: 2 or 3 (century indicator for Egyptian IDs)
    id += rand() < 0.7 ? "2" : "3";
    for (let i = 1; i < 14; i++) {
        id += String(Math.floor(rand() * 10));
    }
    return id;
}

function generatePhone(rand: () => number): string {
    const prefixes = ["10", "11", "12", "15"];
    const prefix = pickFrom(prefixes, rand);
    let number = "";
    for (let i = 0; i < 8; i++) {
        number += String(Math.floor(rand() * 10));
    }
    return `+20-${prefix[0]}${prefix[1]}${number.slice(0, 1)}-${number.slice(1, 4)}-${number.slice(4, 8)}`;
}

// ── Main generation ─────────────────────────────────────────────────────────

function generateEmployeeCvs(): EmployeeCvInterface[] {
    const cvs: EmployeeCvInterface[] = [];

    for (let mi = 0; mi < seedEmployees.length; mi++) {
        const employee = seedEmployees[mi];
        const rand = seededRandom(mi * 1337 + 42);
        const tenure = getTenureInfo(employee.joiningDate);
        const joiningDate = new Date(employee.joiningDate);

        // ── Gender (based on first name from employee seed) ─────────────
        const firstName = employee.name.split(" ")[0];
        const gender: "ذكر" | "أنثى" = FEMALE_NAME_SET.has(firstName) || isFemaleRole(employee.role)
            ? "أنثى"
            : "ذكر";

        // ── Birth date ──────────────────────────────────────────────────
        // Age at joining: 22-40 years
        const ageAtJoining = 22 + Math.floor(rand() * 18);
        const birthYear = joiningDate.getFullYear() - ageAtJoining;
        const birthMonth = Math.floor(rand() * 12);
        const birthDay = 1 + Math.floor(rand() * 28);
        const birthDate = formatIsoDate(new Date(birthYear, birthMonth, birthDay));

        // ── Marital status (age-weighted, gendered Arabic) ────────────
        const currentAge = ageAtJoining + tenure.years;
        const isFemale = gender === "أنثى";
        let maritalStatus: string;
        const maritalRoll = rand();
        if (currentAge < 28) {
            const base = maritalRoll < 0.6 ? 0 : maritalRoll < 0.85 ? 1 : maritalRoll < 0.95 ? 2 : 3;
            maritalStatus = isFemale
                ? (["عزباء", "متزوجة", "مطلقة", "أرملة"] as const)[base]
                : (["أعزب", "متزوج", "مطلق", "أرمل"] as const)[base];
        } else {
            const base = maritalRoll < 0.5 ? 1 : maritalRoll < 0.8 ? 0 : maritalRoll < 0.9 ? 2 : 3;
            maritalStatus = isFemale
                ? (["عزباء", "متزوجة", "مطلقة", "أرملة"] as const)[base]
                : (["أعزب", "متزوج", "مطلق", "أرمل"] as const)[base];
        }

        // ── Children ────────────────────────────────────────────────────
        let childrenCount = 0;
        if (maritalStatus !== "أعزب" && maritalStatus !== "عزباء") {
            // Weighted toward 1-3
            const childRoll = rand();
            if (childRoll < 0.1) childrenCount = 0;
            else if (childRoll < 0.35) childrenCount = 1;
            else if (childRoll < 0.65) childrenCount = 2;
            else if (childRoll < 0.85) childrenCount = 3;
            else if (childRoll < 0.95) childrenCount = 4;
            else childrenCount = 5;
        }

        // ── Military status ─────────────────────────────────────────────
        let militaryStatus: string;
        if (gender === "أنثى") {
            militaryStatus = "-";
        } else {
            const milRoll = rand();
            if (milRoll < 0.6) militaryStatus = "أدى الخدمة";
            else if (milRoll < 0.8) militaryStatus = "معفى";
            else if (milRoll < 0.9) militaryStatus = "مؤجل";
            else militaryStatus = "غير مطلوب";
        }

        // ── National ID ─────────────────────────────────────────────────
        const nationalId = generateNationalId(rand);

        // ── Phone ───────────────────────────────────────────────────────
        const phone = generatePhone(rand);

        // ── Address ─────────────────────────────────────────────────────
        const address = pickFrom(ADDRESSES, rand);

        // ── Education (department-aligned, ~10% career-shift edge cases) ──
        const isCareerShift = rand() < 0.1;
        const educationPool = isCareerShift ? GENERIC_DEGREES : (DEPARTMENT_EDUCATION[employee.subDepartmentId] || GENERIC_DEGREES);
        const education = pickFrom(educationPool, rand);
        const university = pickFrom(UNIVERSITIES, rand);

        // Graduation year: birth year + 22 (typical Egyptian graduation age)
        const graduationYear = birthYear + 22;

        // ── Skills (department-based, 3-7 count) ────────────────────────
        const deptSkills = DEPARTMENT_SKILLS[employee.subDepartmentId] || DEPARTMENT_SKILLS["dept-admin"];
        let skillCount: number;
        if (tenure.isNewJoiner) {
            skillCount = 3 + Math.floor(rand() * 2); // 3-4
        } else if (tenure.isSenior) {
            skillCount = 5 + Math.floor(rand() * 3); // 5-7
        } else {
            skillCount = 3 + Math.floor(rand() * 4); // 3-6
        }
        skillCount = Math.min(skillCount, deptSkills.length);
        const skills = pickMultiple(deptSkills, skillCount, rand);

        // ── Work experiences ────────────────────────────────────────────
        let expCount: number;
        if (tenure.isNewJoiner) {
            expCount = Math.floor(rand() * 2); // 0-1
        } else if (tenure.isSenior) {
            expCount = 3 + Math.floor(rand() * 4); // 3-6
        } else {
            expCount = 1 + Math.floor(rand() * 3); // 1-3
        }

        const experiences: WorkExperienceInterface[] = [];
        const deptExpRoles = DEPARTMENT_EXPERIENCE_ROLES[employee.subDepartmentId] || DEPARTMENT_EXPERIENCE_ROLES["dept-admin"];
        // Work backwards from joining date
        let expEndDate = new Date(joiningDate.getTime() - Math.floor(rand() * 90) * 24 * 60 * 60 * 1000); // gap before joining

        for (let e = 0; e < expCount; e++) {
            const durationMonths = 6 + Math.floor(rand() * 48); // 6-53 months
            const startMs = expEndDate.getTime() - durationMonths * 30.44 * 24 * 60 * 60 * 1000;
            const startDate = new Date(startMs);

            experiences.push({
                company: pickFrom(COMPANIES, rand),
                role: pickFrom(deptExpRoles, rand),
                startDate: formatIsoDate(startDate),
                endDate: formatIsoDate(expEndDate),
                description: pickFrom(DESCRIPTIONS, rand),
            });

            // Gap between jobs: 1-6 months
            const gapMonths = 1 + Math.floor(rand() * 6);
            expEndDate = new Date(startMs - gapMonths * 30.44 * 24 * 60 * 60 * 1000);
        }

        // ── Certifications ──────────────────────────────────────────────
        let certCount: number;
        if (tenure.isNewJoiner) {
            certCount = Math.floor(rand() * 2); // 0-1
        } else if (tenure.isSenior) {
            certCount = 2 + Math.floor(rand() * 3); // 2-4
        } else {
            certCount = Math.floor(rand() * 3); // 0-2
        }
        const deptCerts = [...(DEPARTMENT_CERTIFICATIONS[employee.subDepartmentId] || []), ...GENERAL_CERTIFICATIONS];
        certCount = Math.min(certCount, deptCerts.length);

        const selectedCerts = pickMultiple(deptCerts, certCount, rand);
        const certifications: CertificationInterface[] = selectedCerts.map((cert) => {
            // Certification date: between graduation and now
            const certYearOffset = Math.floor(rand() * (tenure.years + 5));
            const certYear = graduationYear + certYearOffset;
            const certMonth = Math.floor(rand() * 12);
            const certDay = 1 + Math.floor(rand() * 28);
            return {
                name: cert.name,
                issuer: cert.issuer,
                date: formatIsoDate(new Date(certYear, certMonth, certDay)),
            };
        });

        // ── Courses ─────────────────────────────────────────────────────
        let courseCount: number;
        if (tenure.isNewJoiner) {
            courseCount = 0;
        } else if (tenure.isSenior) {
            courseCount = 1 + Math.floor(rand() * 3); // 1-3
        } else {
            courseCount = Math.floor(rand() * 3); // 0-2
        }
        const deptCourses = [...(DEPARTMENT_COURSES[employee.subDepartmentId] || []), ...GENERAL_COURSES];
        courseCount = Math.min(courseCount, deptCourses.length);

        const selectedCourses = pickMultiple(deptCourses, courseCount, rand);
        const courses: CourseInterface[] = selectedCourses.map((course) => {
            const courseYearOffset = Math.floor(rand() * (tenure.years + 3));
            const courseYear = graduationYear + courseYearOffset;
            const courseMonth = Math.floor(rand() * 12);
            const courseDay = 1 + Math.floor(rand() * 28);
            return {
                name: course.name,
                provider: course.provider,
                date: formatIsoDate(new Date(courseYear, courseMonth, courseDay)),
                duration: course.duration,
            };
        });

        // ── Push CV ─────────────────────────────────────────────────────
        cvs.push({
            employeeId: employee.id,
            nationalId,
            gender,
            birthDate,
            maritalStatus,
            childrenCount,
            militaryStatus,
            phone,
            address,
            education,
            university,
            graduationYear,
            skills,
            experiences,
            certifications,
            courses,
        });
    }

    return cvs;
}

export const seedEmployeeCvs: EmployeeCvInterface[] = generateEmployeeCvs();
