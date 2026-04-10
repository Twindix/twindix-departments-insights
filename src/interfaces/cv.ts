export interface WorkExperienceInterface {
    company: string; // Arabic company name
    role: string; // Arabic job title
    startDate: string; // ISO date
    endDate: string | null; // null = current job
    description: string; // Arabic description of responsibilities
}

export interface CertificationInterface {
    name: string; // Arabic certification name
    issuer: string; // Arabic issuer name
    date: string; // ISO date
}

export interface CourseInterface {
    name: string; // Arabic course name
    provider: string; // Arabic provider name
    date: string; // ISO date
    duration: string; // e.g., "٤٠ ساعة"
}

export interface EmployeeCvInterface {
    employeeId: string;
    nationalId: string; // 14-digit Egyptian national ID
    gender: "ذكر" | "أنثى"; // Male/Female in Arabic
    birthDate: string; // ISO date
    maritalStatus: string; // Gendered Arabic: أعزب/عزباء, متزوج/متزوجة, مطلق/مطلقة, أرمل/أرملة
    childrenCount: number;
    militaryStatus: string; // أدى الخدمة / معفى / مؤجل / غير مطلوب / "-" for females
    phone: string; // Egyptian phone format
    address: string; // Arabic address
    education: string; // Arabic education degree
    university: string; // Arabic university name
    graduationYear: number;
    skills: string[]; // Arabic skills array
    experiences: WorkExperienceInterface[];
    certifications: CertificationInterface[];
    courses: CourseInterface[];
}
