import { Outlet } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Sidebar, Topbar, MobileNav } from "@/components/shared";
import { useSidebarStore } from "@/store";
import { useSettings } from "@/hooks";

export function DashboardLayout() {
    const { isOpen } = useSidebarStore();
    // Initialize settings (syncs compact class to <html>)
    useSettings();

    const currentYear = new Date().getFullYear();

    return (
        <div className="flex min-h-screen bg-[var(--color-bg)] overflow-x-hidden">
            <Sidebar />
            <MobileNav />

            <div
                className={`flex flex-1 flex-col min-w-0 transition-all duration-300 ${
                    isOpen ? "lg:mr-[220px]" : "lg:mr-[64px]"
                }`}
            >
                <Topbar />
                <main className="flex-1 p-4 pt-20 lg:p-6 lg:pt-22 min-w-0 overflow-x-hidden">
                    <Outlet />
                </main>
                <footer className="relative overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-sm">
                    {/* Animated gradient sweep */}
                    <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
                        <div
                            className="absolute inset-y-0 -inset-x-1/2 bg-gradient-to-l from-transparent via-[var(--color-primary)]/10 to-transparent"
                            style={{
                                animation: "footer-shimmer 6s ease-in-out infinite",
                            }}
                        />
                    </div>

                    <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-4 text-xs sm:flex-row sm:gap-3">
                        <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                            <span className="tabular-nums">© {currentYear}</span>
                            <span>جميع الحقوق محفوظة لـ</span>
                        </div>
                        <a
                            href="https://twindix.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 font-semibold text-[var(--color-primary)] transition-all duration-300 hover:gap-2 hover:text-[var(--color-primary-hover)]"
                            dir="ltr"
                        >
                            <Sparkles className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-180" />
                            <span className="bg-gradient-to-l from-[var(--color-primary)] to-[var(--color-primary-hover)] bg-clip-text text-transparent">
                                Twindix Global Inc.
                            </span>
                        </a>
                    </div>
                </footer>
            </div>
        </div>
    );
}
