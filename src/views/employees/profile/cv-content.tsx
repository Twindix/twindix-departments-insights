import {
    User,
    Hash,
    Heart,
    Baby,
    Shield,
    Phone,
    Mail,
    MapPin,
    CalendarDays,
    GraduationCap,
    Sparkles,
    Briefcase,
    Award,
    BookOpen,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/atoms";
import type { EmployeeCvInterface, EmployeeInterface } from "@/interfaces";

interface CvContentProps {
    cv: EmployeeCvInterface;
    employee: EmployeeInterface;
    formatDate: (d: string, f?: "short" | "long" | "iso") => string;
}

export function CvContent({ cv, employee, formatDate }: CvContentProps) {
    return (
        <div className="space-y-4">
            {/* Personal Info Grid */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Hash className="h-4 w-4 text-[var(--color-primary)]" />
                        البيانات الشخصية
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                            <span className="text-[var(--color-text-muted)]">الجنس:</span>
                            <span className="font-medium">{cv.gender}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <CalendarDays className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                            <span className="text-[var(--color-text-muted)]">تاريخ الميلاد:</span>
                            <span className="font-medium">{formatDate(cv.birthDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Hash className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                            <span className="text-[var(--color-text-muted)]">الرقم القومي:</span>
                            <span className="font-medium tabular-nums">{cv.nationalId}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Heart className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                            <span className="text-[var(--color-text-muted)]">الحالة الاجتماعية:</span>
                            <span className="font-medium">{cv.maritalStatus}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Baby className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                            <span className="text-[var(--color-text-muted)]">عدد الأبناء:</span>
                            <span className="font-medium">{cv.childrenCount}</span>
                        </div>
                        {cv.militaryStatus !== "-" && (
                            <div className="flex items-center gap-2 text-sm">
                                <Shield className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                                <span className="text-[var(--color-text-muted)]">الموقف من التجنيد:</span>
                                <span className="font-medium">{cv.militaryStatus}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                            <span className="text-[var(--color-text-muted)]">الهاتف:</span>
                            <span className="font-medium tabular-nums" dir="ltr">{cv.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                            <span className="text-[var(--color-text-muted)]">البريد:</span>
                            <span className="font-medium text-xs truncate" dir="ltr">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                            <span className="text-[var(--color-text-muted)]">العنوان:</span>
                            <span className="font-medium">{cv.address}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Education */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-[var(--color-primary)]" />
                        التعليم
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                            <GraduationCap className="h-5 w-5 text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <p className="font-semibold text-[var(--color-text-dark)]">{cv.education}</p>
                            <p className="text-sm text-[var(--color-text-muted)]">{cv.university}</p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">تخرج {cv.graduationYear}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Skills */}
            {cv.skills.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                            المهارات
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {cv.skills.map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs px-3 py-1">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Work Experience */}
            {cv.experiences.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-[var(--color-primary)]" />
                            الخبرات العملية
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative space-y-6">
                            <div className="absolute top-2 right-[19px] bottom-2 w-px bg-[var(--color-border)]" />
                            {cv.experiences.map((exp, i) => (
                                <div key={i} className="flex gap-4 relative">
                                    <div className="h-10 w-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shrink-0 z-10">
                                        <Briefcase className="h-4 w-4 text-[var(--color-text-muted)]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between flex-wrap gap-1">
                                            <p className="font-semibold text-[var(--color-text-dark)]">{exp.role}</p>
                                            <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
                                                {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : "حتى الآن"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--color-primary)] font-medium">{exp.company}</p>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">{exp.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Certifications */}
            {cv.certifications.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Award className="h-4 w-4 text-[var(--color-primary)]" />
                            الشهادات المهنية
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {cv.certifications.map((cert, i) => (
                                <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] p-3 bg-[var(--color-surface)]/50">
                                    <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                        <Award className="h-4 w-4 text-amber-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm text-[var(--color-text-dark)] truncate">{cert.name}</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">{cert.issuer}</p>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{formatDate(cert.date)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Courses */}
            {cv.courses.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-[var(--color-primary)]" />
                            الدورات التدريبية
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {cv.courses.map((course, i) => (
                                <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] p-3 bg-[var(--color-surface)]/50">
                                    <div className="h-9 w-9 rounded-lg bg-[var(--color-info)]/10 flex items-center justify-center shrink-0">
                                        <BookOpen className="h-4 w-4 text-[var(--color-info)]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm text-[var(--color-text-dark)] truncate">{course.name}</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">{course.provider}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-[var(--color-text-muted)]">{formatDate(course.date)}</span>
                                            <span className="text-xs text-[var(--color-text-muted)]">•</span>
                                            <span className="text-xs text-[var(--color-text-muted)]">{course.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
