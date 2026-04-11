import { Outlet } from "react-router-dom";
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
                <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-sm">
                    <div
                        className="flex items-center justify-center gap-1.5 px-4 py-4 text-xs text-[var(--color-text-secondary)]"
                        style={{ animation: "footer-fade 4s ease-in-out infinite" }}
                    >
                        <span className="tabular-nums">© {currentYear}</span>
                        <span>جميع الحقوق محفوظة لشركة</span>
                        <span className="font-bold text-[var(--color-text-primary)]">
                            تويندكس
                        </span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
