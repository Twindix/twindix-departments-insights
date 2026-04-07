import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { useAuth, useTheme } from "@/hooks";
import { routesData, APP_NAME_AR, DEMO_EMAIL, DEMO_PASSWORD } from "@/data";
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/atoms";

export function LoginView() {
    const navigate = useNavigate();
    const { onLogin } = useAuth();
    const { isDarkMode, onToggleTheme } = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError("");

        const success = onLogin(email, password);
        if (success) {
            navigate(routesData.dashboard);
        } else {
            setError("بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.");
        }
    };

    return (
        <div className="relative">
            {/* Theme toggle */}
            <div className="absolute -top-12 left-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleTheme}
                    aria-label={isDarkMode ? "الوضع الفاتح" : "الوضع الداكن"}
                >
                    {isDarkMode ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </Button>
            </div>

            <Card>
                <CardHeader className="text-center">
                    <img src="/favicon.svg" alt="logo" className="mx-auto mb-4 h-14 w-14" />
                    <CardTitle className="text-xl">{APP_NAME_AR}</CardTitle>
                    <CardDescription>
                        سجّل دخولك للوصول إلى لوحة تحليلات الأقسام
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="hr.performance.admin@twindix.com"
                                required
                                autoFocus
                                dir="rtl"
                                className="text-right"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="••••••"
                                    required
                                    dir="rtl"
                                    className="text-right pl-10"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-[var(--color-error)] bg-[var(--color-error-light)] rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <Button type="submit" className="w-full gap-2">
                            <LogIn className="h-4 w-4" />
                            تسجيل الدخول
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex-col">
                    <div className="w-full rounded-xl bg-[var(--color-surface)] p-4">
                        <p className="text-xs font-medium text-[var(--color-text-muted)] mb-3 text-center">
                            بيانات الدخول التجريبية
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-lg bg-[var(--color-bg)] px-3 py-2 border border-[var(--color-border)]">
                                <span className="text-xs text-[var(--color-text-muted)]">البريد الإلكتروني</span>
                                <code className="text-xs font-semibold text-[var(--color-primary)] font-mono" dir="ltr">
                                    {DEMO_EMAIL}
                                </code>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-[var(--color-bg)] px-3 py-2 border border-[var(--color-border)]">
                                <span className="text-xs text-[var(--color-text-muted)]">كلمة المرور</span>
                                <code className="text-xs font-semibold text-[var(--color-primary)] font-mono" dir="ltr">
                                    {DEMO_PASSWORD}
                                </code>
                            </div>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
