import { Sun, Moon, Palette, Calendar, Info, Minimize2, Maximize2 } from "lucide-react";
import { Header, SettingsSkeleton } from "@/components/shared";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/atoms";
import { useTheme, useSettings, useDeferredLoad, usePageTitle } from "@/hooks";
import { APP_NAME_AR, APP_VERSION } from "@/data";
import { cn } from "@/utils";

function ToggleSwitch({ checked, onChange, iconOn, iconOff }: { checked: boolean; onChange: () => void; iconOn?: React.ReactNode; iconOff?: React.ReactNode }) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={cn(
                "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
                checked ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-active)]"
            )}
        >
            <span
                className={cn(
                    "pointer-events-none flex h-5.5 w-5.5 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200",
                    checked ? "-translate-x-5.5" : "-translate-x-0.5"
                )}
            >
                {checked ? iconOn : iconOff}
            </span>
        </button>
    );
}

export function SettingsView() {
    const { isDarkMode, onToggleTheme } = useTheme();
    const { dateFormat, compactView, onUpdateSettings } = useSettings();
    const isReady = useDeferredLoad(100);
    usePageTitle("الإعدادات");

    if (!isReady) return <SettingsSkeleton />;

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl">
            <Header
                title="الإعدادات"
                description="تخصيص تجربة الاستخدام"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-[var(--color-primary)]" />
                        المظهر
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                الوضع الداكن
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                                التبديل بين المظهر الفاتح والداكن
                            </p>
                        </div>
                        <ToggleSwitch
                            checked={isDarkMode}
                            onChange={onToggleTheme}
                            iconOn={<Moon className="h-3 w-3 text-[var(--color-primary)]" />}
                            iconOff={<Sun className="h-3 w-3 text-[var(--color-warning)]" />}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                العرض المدمج
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                                تقليل المسافات بين العناصر
                            </p>
                        </div>
                        <ToggleSwitch
                            checked={compactView}
                            onChange={() => onUpdateSettings({ compactView: !compactView })}
                            iconOn={<Minimize2 className="h-3 w-3 text-[var(--color-primary)]" />}
                            iconOff={<Maximize2 className="h-3 w-3 text-[var(--color-text-muted)]" />}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[var(--color-primary)]" />
                        تنسيق التاريخ
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {(
                            [
                                { value: "short", label: "مختصر" },
                                { value: "long", label: "كامل" },
                                { value: "iso", label: "ISO" },
                            ] as const
                        ).map((option) => (
                            <Button
                                key={option.value}
                                variant={
                                    dateFormat === option.value
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                    onUpdateSettings({
                                        dateFormat: option.value,
                                    })
                                }
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-[var(--color-primary)]" />
                        حول التطبيق
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                        <div className="flex justify-between">
                            <span>التطبيق</span>
                            <span className="font-medium">{APP_NAME_AR}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>الإصدار</span>
                            <span className="font-mono">{APP_VERSION}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>المطور</span>
                            <a href="https://twindix.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline" dir="ltr">Twindix Global Inc.</a>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
