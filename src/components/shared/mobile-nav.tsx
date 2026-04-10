import { useLocation, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { sidebarItems, APP_NAME_AR } from "@/data";
import { cn } from "@/utils";

export function MobileNav() {
    const { pathname } = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Hamburger button - visible only on mobile */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] shadow-sm lg:hidden cursor-pointer"
            >
                <Menu className="h-5 w-5 text-[var(--color-text-primary)]" />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={cn(
                    "fixed top-0 right-0 z-50 h-full w-[280px] bg-[var(--color-sidebar-bg)] border-l border-[var(--color-sidebar-border)] shadow-xl transition-transform duration-300 lg:hidden",
                    isOpen ? "translate-x-0" : "translate-x-full",
                )}
            >
                <div className="flex h-16 items-center justify-between border-b border-[var(--color-sidebar-border)] px-4">
                    <span className="text-lg font-bold text-[var(--color-primary)]">
                        {APP_NAME_AR}
                    </span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--color-sidebar-item-hover)] cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <nav className="space-y-1 p-3">
                    {sidebarItems.map((item) => {
                        const isActive =
                            pathname === item.path ||
                            (item.path !== "/" &&
                                pathname.startsWith(item.path));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-[var(--color-sidebar-item-active)] text-[var(--color-primary)]"
                                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-item-hover)]",
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
