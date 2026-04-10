import type { EmployeeInsightsInterface } from "@/interfaces";
import { seedEmployees } from "./employees";

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

const ARABIC_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const INTRODUCTION =
    "لقد قامت الشركة بإنشاء نظام لتقييم الأداء يهدف إلى رفع الإنتاجية وتطوير أداء الموظفين. المديرون مسئولون عن ضمان مراجعة وتسجيل تقييم أداء الموظف. إن تقييم الأداء من أفضل وسائل الإتصال التي تساعد على إعطاء أفضل النتائج من خلال: زيادة وضوح الأدوار الوظيفية وتطوير الأداء إلى الأفضل، التدريب والتطوير، التعويضات والمكافآت، التخطيط الوظيفي والترقيات.";

interface KpiDef {
    kpiName: string;
    formula: string;
    weight: number;
    targetBase: number;
}

const DEPARTMENT_KPI_DEFINITIONS: Record<string, KpiDef[]> = {
    "dept-hr": [
        { kpiName: "معدل إنجاز عمليات التوظيف", formula: "عدد الوظائف المشغولة / عدد الوظائف المطلوبة", weight: 0.20, targetBase: 100 },
        { kpiName: "معدل تنفيذ برامج التدريب", formula: "عدد البرامج المنفذة / عدد البرامج المخططة", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل رضا الموظفين", formula: "نتيجة استبيان الرضا / النتيجة المستهدفة", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل دوران العمالة", formula: "عدد المغادرين / إجمالي الموظفين", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل الالتزام بسياسات الموارد البشرية", formula: "عدد الملتزمين / إجمالي الموظفين", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل تحديث بيانات الموظفين", formula: "عدد السجلات المحدثة / إجمالي السجلات", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل إنجاز تقييمات الأداء", formula: "عدد التقييمات المنجزة / عدد التقييمات المطلوبة", weight: 0.05, targetBase: 100 },
    ],
    "dept-it": [
        { kpiName: "معدل حل التذاكر التقنية", formula: "عدد التذاكر المحلولة / إجمالي التذاكر", weight: 0.20, targetBase: 100 },
        { kpiName: "معدل وقت تشغيل الأنظمة", formula: "ساعات التشغيل الفعلية / ساعات التشغيل المستهدفة", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل إنجاز المشاريع التقنية", formula: "عدد المشاريع المنجزة / عدد المشاريع المخططة", weight: 0.20, targetBase: 100 },
        { kpiName: "معدل أمان النظم", formula: "عدد الحوادث الأمنية المعالجة / إجمالي الحوادث", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل رضا المستخدمين", formula: "نتيجة استبيان الرضا / النتيجة المستهدفة", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل تحديث الأنظمة", formula: "عدد التحديثات المنفذة / التحديثات المطلوبة", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل الاستجابة للطوارئ التقنية", formula: "عدد الحالات المعالجة في الوقت / إجمالي الحالات", weight: 0.05, targetBase: 100 },
    ],
    "dept-finance": [
        { kpiName: "معدل دقة التقارير المالية", formula: "عدد التقارير الدقيقة / إجمالي التقارير", weight: 0.20, targetBase: 100 },
        { kpiName: "معدل إنجاز المراجعات", formula: "عدد المراجعات المنجزة / المراجعات المطلوبة", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل الالتزام بالميزانيات", formula: "المصروفات الفعلية / الميزانية المعتمدة", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل تحصيل المستحقات", formula: "المبالغ المحصلة / المبالغ المستحقة", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل تقليل التكاليف", formula: "التوفير المحقق / التوفير المستهدف", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل إعداد الميزانيات", formula: "عدد الميزانيات المعدة في الوقت / إجمالي الميزانيات", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل الالتزام بالمعايير المحاسبية", formula: "عدد العمليات المتوافقة / إجمالي العمليات", weight: 0.05, targetBase: 100 },
    ],
    "dept-projects": [
        { kpiName: "معدل إنجاز المشاريع في الوقت", formula: "عدد المشاريع المنجزة في الوقت / إجمالي المشاريع", weight: 0.20, targetBase: 100 },
        { kpiName: "معدل الالتزام بميزانيات المشاريع", formula: "التكلفة الفعلية / التكلفة المخططة", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل جودة التسليمات", formula: "عدد التسليمات المقبولة / إجمالي التسليمات", weight: 0.20, targetBase: 100 },
        { kpiName: "معدل رضا أصحاب المصلحة", formula: "نتيجة استبيان الرضا / النتيجة المستهدفة", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل إدارة المخاطر", formula: "عدد المخاطر المعالجة / إجمالي المخاطر المحددة", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل التوثيق", formula: "عدد المستندات المحدثة / إجمالي المستندات المطلوبة", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل التنسيق بين الفرق", formula: "عدد الاجتماعات المنفذة / الاجتماعات المخططة", weight: 0.05, targetBase: 100 },
    ],
    "dept-customer": [
        { kpiName: "معدل رضا العملاء", formula: "نتيجة استبيان الرضا / النتيجة المستهدفة", weight: 0.25, targetBase: 100 },
        { kpiName: "معدل حل الشكاوى", formula: "عدد الشكاوى المحلولة / إجمالي الشكاوى", weight: 0.20, targetBase: 100 },
        { kpiName: "معدل وقت الاستجابة", formula: "الوقت الفعلي للاستجابة / الوقت المستهدف", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل الاحتفاظ بالعملاء", formula: "عدد العملاء المستمرين / إجمالي العملاء", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل جودة الخدمة", formula: "عدد التقييمات الإيجابية / إجمالي التقييمات", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل متابعة العملاء", formula: "عدد المتابعات المنفذة / المتابعات المخططة", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل التعامل مع الحالات", formula: "عدد الحالات المغلقة / إجمالي الحالات", weight: 0.05, targetBase: 100 },
    ],
    "dept-commercial": [
        { kpiName: "معدل إنجاز العقود", formula: "عدد العقود المنجزة / العقود المستهدفة", weight: 0.25, targetBase: 100 },
        { kpiName: "معدل تطوير الأعمال", formula: "عدد الفرص المحققة / الفرص المستهدفة", weight: 0.20, targetBase: 100 },
        { kpiName: "معدل نجاح التفاوض", formula: "عدد الصفقات الناجحة / إجمالي المفاوضات", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل تحليل السوق", formula: "عدد التقارير المنجزة / التقارير المطلوبة", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل إدارة الشراكات", formula: "عدد الشراكات الفعالة / إجمالي الشراكات", weight: 0.10, targetBase: 50 },
        { kpiName: "معدل دراسات الجدوى", formula: "عدد الدراسات المنجزة / الدراسات المطلوبة", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل التنسيق التجاري", formula: "عدد العمليات المنسقة / إجمالي العمليات", weight: 0.05, targetBase: 100 },
    ],
    "dept-marketing": [
        { kpiName: "معدل نجاح الحملات", formula: "عدد الحملات الناجحة / إجمالي الحملات", weight: 0.20, targetBase: 100 },
        { kpiName: "معدل التفاعل الرقمي", formula: "معدل التفاعل الفعلي / المستهدف", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل النمو في المتابعين", formula: "عدد المتابعين الجدد / المستهدف", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل تحويل العملاء المحتملين", formula: "عدد العملاء المحولين / إجمالي المحتملين", weight: 0.20, targetBase: 100 },
        { kpiName: "معدل إنتاج المحتوى", formula: "عدد المحتويات المنشورة / المخطط لها", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل تحسين محركات البحث", formula: "ترتيب الموقع الفعلي / الترتيب المستهدف", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل العائد على الإنفاق الإعلاني", formula: "العائد المحقق / المبلغ المنفق", weight: 0.05, targetBase: 100 },
    ],
    "dept-admin": [
        { kpiName: "معدل إنجاز المهام الإدارية", formula: "عدد المهام المنجزة / إجمالي المهام", weight: 0.20, targetBase: 100 },
        { kpiName: "معدل تنظيم الاجتماعات", formula: "عدد الاجتماعات المنظمة بنجاح / إجمالي الاجتماعات", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل إدارة المراسلات", formula: "عدد المراسلات المعالجة / إجمالي المراسلات", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل صيانة المرافق", formula: "عدد طلبات الصيانة المنجزة / إجمالي الطلبات", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل إدارة الأرشيف", formula: "عدد الملفات المؤرشفة / إجمالي الملفات", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل الدعم اللوجستي", formula: "عدد الطلبات المنفذة / إجمالي الطلبات", weight: 0.15, targetBase: 100 },
        { kpiName: "معدل الالتزام بالإجراءات", formula: "عدد العمليات المتوافقة / إجمالي العمليات", weight: 0.05, targetBase: 100 },
    ],
    "dept-sales": [
        { kpiName: "معدل المتابعات الدورية", formula: "عدد المتابعات الفعلية / عدد المتابعات المستهدفة", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل تنفيذ الأنشطة والزيارات", formula: "عدد الأنشطة المنفذة / عدد الأنشطة المخططة", weight: 0.20, targetBase: 100 },
        { kpiName: "معدل الزيارات", formula: "عدد الزيارات الفعلية / عدد الزيارات المستهدفة", weight: 0.10, targetBase: 100 },
        { kpiName: "معدل العقود", formula: "عدد العقود المنجزة / عدد العقود المستهدفة", weight: 0.05, targetBase: 50 },
        { kpiName: "معدل العقود للزيارات", formula: "عدد العقود / عدد الزيارات", weight: 0.10, targetBase: 100 },
        { kpiName: "نسبة التارجت المحقق بالجنيه", formula: "المبلغ المحقق / المبلغ المستهدف", weight: 0.40, targetBase: 100 },
        { kpiName: "معدل التقارير الدورية", formula: "عدد التقارير المسلمة / عدد التقارير المطلوبة", weight: 0.05, targetBase: 100 },
    ],
};

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

const DEPARTMENT_THIRD_COMPETENCY: Record<string, { name: string; definition: string; levels: { level: number; description: string }[] }> = {
    "dept-sales": {
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
    "dept-commercial": {
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
    "dept-customer": {
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
    "dept-it": {
        name: "الابتكار التقني",
        definition: "القدرة على تطوير حلول تقنية مبتكرة وتحسين الأنظمة باستمرار",
        levels: [
            { level: 1, description: "يفهم الأنظمة التقنية الأساسية ويتبع الإجراءات المعتمدة لحل المشكلات" },
            { level: 2, description: "يقترح تحسينات تقنية بسيطة ويبادر بتعلم أدوات وتقنيات جديدة" },
            { level: 3, description: "يطور حلول تقنية فعالة للمشكلات المتكررة ويساهم في تحسين البنية التحتية" },
            { level: 4, description: "يقود مبادرات التحسين التقني ويدمج تقنيات حديثة لرفع كفاءة الأنظمة" },
            { level: 5, description: "يضع استراتيجيات تقنية مبتكرة ويقود التحول الرقمي على مستوى المنظمة" },
        ],
    },
    "dept-finance": {
        name: "الدقة والالتزام بالمعايير",
        definition: "الالتزام بالدقة في العمل المالي وتطبيق المعايير المحاسبية",
        levels: [
            { level: 1, description: "يفهم المعايير المحاسبية الأساسية ويلتزم بإجراءات العمل المالي" },
            { level: 2, description: "يراجع عمله بدقة ويتأكد من مطابقة البيانات المالية للمعايير المعتمدة" },
            { level: 3, description: "يكتشف الأخطاء المالية ويصححها ويضمن دقة التقارير والقوائم المالية" },
            { level: 4, description: "يطور آليات الرقابة المالية ويضمن الالتزام الكامل بالمعايير المحاسبية الدولية" },
            { level: 5, description: "يقود تطبيق أفضل الممارسات المالية ويضع سياسات لضمان الدقة والشفافية المالية" },
        ],
    },
    "dept-hr": {
        name: "إدارة العلاقات والتطوير المهني",
        definition: "القدرة على بناء علاقات مهنية فعالة وتطوير الكفاءات",
        levels: [
            { level: 1, description: "يفهم أهمية العلاقات المهنية ويتعامل باحترام مع جميع الموظفين" },
            { level: 2, description: "يبادر ببناء علاقات إيجابية ويساهم في تحديد الاحتياجات التدريبية للموظفين" },
            { level: 3, description: "يدير العلاقات المهنية بفعالية ويصمم برامج تطوير مهني ملائمة" },
            { level: 4, description: "يبني شبكات علاقات مهنية واسعة ويقود مبادرات تطوير الكفاءات على مستوى الإدارة" },
            { level: 5, description: "يضع استراتيجيات لتطوير رأس المال البشري ويقود ثقافة التعلم المستمر في المنظمة" },
        ],
    },
    "dept-projects": {
        name: "إدارة الأولويات والموارد",
        definition: "القدرة على تحديد الأولويات وتخصيص الموارد بكفاءة",
        levels: [
            { level: 1, description: "يفهم أولويات المشروع ويلتزم بالخطط الموضوعة لتنفيذ المهام" },
            { level: 2, description: "يرتب مهامه حسب الأولوية ويستخدم الموارد المتاحة بكفاءة" },
            { level: 3, description: "يوازن بين أولويات متعددة ويعيد تخصيص الموارد عند الحاجة لضمان التسليم" },
            { level: 4, description: "يقود تخطيط الموارد للمشاريع المعقدة ويتوقع المخاطر ويضع خطط بديلة" },
            { level: 5, description: "يضع استراتيجيات لإدارة محفظة المشاريع ويحسن تخصيص الموارد على مستوى المنظمة" },
        ],
    },
    "dept-marketing": {
        name: "الإبداع والتحليل",
        definition: "القدرة على الإبداع في الحملات التسويقية وتحليل البيانات",
        levels: [
            { level: 1, description: "يفهم أساسيات التسويق ويتابع الحملات المنفذة ويجمع البيانات الأساسية" },
            { level: 2, description: "يقترح أفكار تسويقية جديدة ويحلل نتائج الحملات لتحديد نقاط التحسين" },
            { level: 3, description: "يصمم حملات تسويقية مبتكرة ويستخدم أدوات التحليل لقياس الأداء بدقة" },
            { level: 4, description: "يقود استراتيجيات تسويقية إبداعية ويبني نماذج تحليلية لتوقع سلوك العملاء" },
            { level: 5, description: "يضع رؤى تسويقية مبتكرة ويقود التحول في استراتيجيات العلامة التجارية بناءً على تحليل معمق" },
        ],
    },
    "dept-admin": {
        name: "التنظيم والكفاءة الإدارية",
        definition: "القدرة على تنظيم العمل الإداري وتحسين الكفاءة التشغيلية",
        levels: [
            { level: 1, description: "يفهم الإجراءات الإدارية الأساسية وينفذ المهام الموكلة إليه بانتظام" },
            { level: 2, description: "ينظم عمله بكفاءة ويلتزم بالجداول الزمنية والإجراءات المعتمدة" },
            { level: 3, description: "يحسن العمليات الإدارية ويقترح حلول لتبسيط الإجراءات وزيادة الكفاءة" },
            { level: 4, description: "يقود مبادرات تطوير الأنظمة الإدارية ويضع معايير لقياس الكفاءة التشغيلية" },
            { level: 5, description: "يضع استراتيجيات لتحسين الكفاءة الإدارية الشاملة ويقود التحول في العمليات التشغيلية" },
        ],
    },
};

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

function generateInsights(): EmployeeInsightsInterface[] {
    const insights: EmployeeInsightsInterface[] = [];

    for (let mi = 0; mi < seedEmployees.length; mi++) {
        const employee = seedEmployees[mi];
        const rand = seededRandom(mi * 777 + 123);

        // Resolve department-specific KPI definitions
        const deptId = employee.subDepartmentId;
        const kpiDefs = DEPARTMENT_KPI_DEFINITIONS[deptId] || DEPARTMENT_KPI_DEFINITIONS["dept-sales"];

        // Generate objectives with varied actual performance
        const objectives = kpiDefs.map((kpi, ki) => {
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
        const usedWeight = kpiDefs.reduce((sum, k) => sum + k.weight, 0);
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
            objectives.reduce((sum, obj) => sum + (obj.actualPerformance / 100) * obj.relativeWeight, 0) * 1000,
        ) / 1000;

        // Build per-employee competency template with department-specific 3rd competency
        const thirdComp = DEPARTMENT_THIRD_COMPETENCY[deptId] || DEPARTMENT_THIRD_COMPETENCY["dept-sales"];
        const employeeCompetencies = [
            CORE_COMPETENCIES_TEMPLATE[0],
            CORE_COMPETENCIES_TEMPLATE[1],
            thirdComp,
        ];

        // Generate competencies with varied levels per member
        const competencies = employeeCompetencies.map((comp, ci) => {
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
            (competencies.reduce((sum, c) => sum + c.score, 0) / competencies.length) * 1000,
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
                administrativeScore * administrativeWeight) * 100 * 10,
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

        // Generate evaluation period as a recent date (within last 14 days, varied per employee)
        const daysAgo = Math.floor(rand() * 14); // 0-13 days ago
        const evalDate = new Date();
        evalDate.setDate(evalDate.getDate() - daysAgo);
        const evalDay = evalDate.getDate();
        const evalMonth = ARABIC_MONTHS[evalDate.getMonth()];
        const evalYear = evalDate.getFullYear();

        insights.push({
            employeeId: employee.id,
            introduction: INTRODUCTION,
            evaluationPeriod: `${evalDay} ${evalMonth} ${evalYear}`,
            department: employee.subDepartmentName,
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

export const seedEmployeeInsights: EmployeeInsightsInterface[] = generateInsights();

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
