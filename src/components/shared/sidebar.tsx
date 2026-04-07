import { useLocation, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebarStore } from "@/store";
import { sidebarItems, APP_VERSION } from "@/data";
import { cn } from "@/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui";

export function Sidebar() {
    const { pathname } = useLocation();
    const { isOpen, onToggle } = useSidebarStore();

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "fixed top-0 right-0 z-40 flex h-screen flex-col border-l border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-bg)] transition-all duration-300 max-lg:hidden",
                    isOpen ? "w-[220px]" : "w-[64px]"
                )}
            >
                {/* Toggle arrow — always positioned outside sidebar */}
                <button
                    onClick={onToggle}
                    className="absolute top-5 -left-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] cursor-pointer transition-colors"
                >
                    {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>

                {/* Logo */}
                <div className={cn(
                    "flex h-16 items-center border-b border-[var(--color-sidebar-border)]",
                    isOpen ? "px-4" : "justify-center"
                )}>
                    {isOpen ? (
                        <div className="flex items-center gap-2 min-w-0">
                            <img src="/favicon.svg" alt="logo" className="h-7 w-7 shrink-0" />
                            <div className="leading-tight min-w-0">
                                <span className="text-xs font-bold text-[var(--color-primary)] block">توينديكس</span>
                                <span className="text-[10px] text-[var(--color-text-muted)]">تحليلات الأقسام</span>
                            </div>
                        </div>
                    ) : (
                        <img src="/favicon.svg" alt="logo" className="h-9 w-9" />
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive =
                            pathname === item.path ||
                            (item.path !== "/" &&
                                pathname.startsWith(item.path));
                        const Icon = item.icon;

                        const link = (
                            <Link
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-[var(--color-sidebar-item-active)] text-[var(--color-primary)]"
                                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-item-hover)] hover:text-[var(--color-text-dark)]"
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {isOpen && <span className="truncate">{item.label}</span>}
                            </Link>
                        );

                        if (!isOpen) {
                            return (
                                <Tooltip key={item.path}>
                                    <TooltipTrigger asChild>
                                        {link}
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return (
                            <div key={item.path}>{link}</div>
                        );
                    })}
                </nav>

                {/* Footer */}
                {isOpen && (
                    <div className="border-t border-[var(--color-sidebar-border)] p-4 text-center">
                        <p className="text-xs text-[var(--color-text-muted)]">
                            v{APP_VERSION}
                        </p>
                    </div>
                )}
            </aside>
        </TooltipProvider>
    );
}
