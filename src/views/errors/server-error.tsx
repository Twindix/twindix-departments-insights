import { useNavigate } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/atoms";
import { APP_NAME_AR, APP_VERSION } from "@/data";

export function ServerErrorView() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-[var(--color-bg)]">
            <div className="w-full max-w-md text-center animate-fade-in">
                <div className="card-base">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-error-light)]">
                        <AlertTriangle className="h-8 w-8 text-[var(--color-error)]" />
                    </div>

                    <h1 className="text-6xl font-bold text-[var(--color-error)] mb-2">
                        500
                    </h1>
                    <h2 className="text-xl font-semibold text-[var(--color-text-dark)] mb-2">
                        خطأ في الخادم
                    </h2>
                    <p className="text-[var(--color-text-muted)] mb-6">
                        حدث خطأ غير متوقع. نعمل على إصلاح المشكلة. يرجى
                        المحاولة مرة أخرى لاحقاً.
                    </p>

                    <div className="flex items-center justify-center gap-3">
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            إعادة المحاولة
                        </Button>
                        <Button
                            onClick={() => navigate("/")}
                            className="gap-2"
                        >
                            <Home className="h-4 w-4" />
                            الصفحة الرئيسية
                        </Button>
                    </div>
                </div>

                <p className="mt-6 text-xs text-[var(--color-text-muted)]">
                    {APP_NAME_AR} v{APP_VERSION}
                </p>
            </div>
        </div>
    );
}
