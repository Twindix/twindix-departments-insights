import { Outlet } from "react-router-dom";
import { Sidebar, Topbar, MobileNav } from "@/components/shared";
import { useSidebarStore } from "@/store";
import { useSettings } from "@/hooks";

export function DashboardLayout() {
    const { isOpen } = useSidebarStore();
    // Initialize settings (syncs compact class to <html>)
    useSettings();

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
                <footer className="py-4 text-center text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
                    طُوّر بواسطة <a href="https://twindix.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline" dir="ltr">Twindix Global Inc.</a>
                </footer>
            </div>
        </div>
    );
}
