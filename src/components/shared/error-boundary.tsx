import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, WifiOff, Copy, Check, RefreshCw, Home } from "lucide-react";
import { Button } from "@/atoms";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    isNetworkError: boolean;
    showDetails: boolean;
    copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = {
        hasError: false,
        error: null,
        isNetworkError: false,
        showDetails: false,
        copied: false,
    };

    static getDerivedStateFromError(error: Error): Partial<State> {
        const isNetworkError =
            error.message.includes("fetch") ||
            error.message.includes("network") ||
            error.message.includes("Failed to load");

        return { hasError: true, error, isNetworkError };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    handleCopy = () => {
        const { error } = this.state;
        if (!error) return;

        const text = `خطأ: ${error.message}\n\nالتفاصيل:\n${error.stack ?? "غير متاح"}`;
        navigator.clipboard.writeText(text).then(() => {
            this.setState({ copied: true });
            setTimeout(() => this.setState({ copied: false }), 2000);
        });
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        const { error, isNetworkError, showDetails, copied } = this.state;
        const Icon = isNetworkError ? WifiOff : AlertTriangle;
        const iconColor = isNetworkError
            ? "var(--color-warning)"
            : "var(--color-error)";

        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-[var(--color-bg)]">
                <div className="w-full max-w-lg animate-fade-in">
                    <div className="card-base text-center">
                        <div
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                            style={{
                                backgroundColor: `${iconColor}20`,
                            }}
                        >
                            <Icon
                                className="h-8 w-8"
                                style={{ color: iconColor }}
                            />
                        </div>

                        <h2 className="text-xl font-bold text-[var(--color-text-dark)] mb-2">
                            {isNetworkError
                                ? "خطأ في الاتصال"
                                : "حدث خطأ غير متوقع"}
                        </h2>

                        <p className="text-[var(--color-text-muted)] mb-6">
                            {isNetworkError
                                ? "يبدو أن هناك مشكلة في الاتصال بالشبكة. يرجى التحقق من اتصالك والمحاولة مرة أخرى."
                                : "نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية."}
                        </p>

                        <div className="flex items-center justify-center gap-3">
                            <Button
                                onClick={() => window.location.reload()}
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                إعادة المحاولة
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    (window.location.href = "/")
                                }
                                className="gap-2"
                            >
                                <Home className="h-4 w-4" />
                                الصفحة الرئيسية
                            </Button>
                        </div>

                        {error && (
                            <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                                <button
                                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] cursor-pointer"
                                    onClick={() =>
                                        this.setState({
                                            showDetails: !showDetails,
                                        })
                                    }
                                >
                                    {showDetails
                                        ? "إخفاء التفاصيل"
                                        : "عرض التفاصيل الفنية"}
                                </button>

                                {showDetails && (
                                    <div className="mt-3 text-right">
                                        <div className="flex items-center justify-between mb-2">
                                            <button
                                                onClick={this.handleCopy}
                                                className="flex items-center gap-1 text-xs text-[var(--color-primary)] cursor-pointer"
                                            >
                                                {copied ? (
                                                    <Check className="h-3 w-3" />
                                                ) : (
                                                    <Copy className="h-3 w-3" />
                                                )}
                                                {copied
                                                    ? "تم النسخ"
                                                    : "نسخ الخطأ"}
                                            </button>
                                        </div>
                                        <pre className="max-h-32 overflow-auto rounded-lg bg-[var(--color-surface)] p-3 text-xs text-[var(--color-text-muted)] text-left ltr">
                                            {error.stack ?? error.message}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
