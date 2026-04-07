import { useNavigate } from "react-router-dom";
import { Sun, Moon, User, Settings, LogOut } from "lucide-react";
import { useAuth, useTheme } from "@/hooks";
import { useSidebarStore } from "@/store";
import { routesData } from "@/data";
import { Button } from "@/atoms";
import {
    Avatar,
    AvatarFallback,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/ui";

export function Topbar() {
    const navigate = useNavigate();
    const { user, onLogout } = useAuth();
    const { isDarkMode, onToggleTheme } = useTheme();
    const { isOpen } = useSidebarStore();

    const handleLogout = () => {
        onLogout();
        navigate(routesData.login);
    };

    return (
        <TooltipProvider delayDuration={200}>
            <header className={`fixed top-0 left-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 px-4 backdrop-blur-sm lg:px-6 transition-all duration-300 right-0 ${isOpen ? "lg:right-[220px]" : "lg:right-[64px]"}`}>
                <div className="flex items-center gap-2 mr-12 lg:mr-0">
                    {/* spacer for mobile hamburger */}
                </div>

                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onToggleTheme}
                                aria-label={
                                    isDarkMode
                                        ? "تفعيل الوضع الفاتح"
                                        : "تفعيل الوضع الداكن"
                                }
                            >
                                {isDarkMode ? (
                                    <Sun className="h-5 w-5" />
                                ) : (
                                    <Moon className="h-5 w-5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {isDarkMode
                                ? "الوضع الفاتح"
                                : "الوضع الداكن"}
                        </TooltipContent>
                    </Tooltip>

                    {/* Avatar Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                        {user?.avatar ?? "م"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden text-sm font-medium text-[var(--color-text-primary)] sm:block">
                                    {user?.name ?? "مستخدم"}
                                </span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>
                                <div>
                                    <p className="text-sm font-medium">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-muted)]">
                                        {user?.email}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-muted)]">
                                        {user?.role}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() =>
                                    navigate(routesData.profile)
                                }
                            >
                                <User className="h-4 w-4 ml-2" />
                                الملف الشخصي
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    navigate(routesData.settings)
                                }
                            >
                                <Settings className="h-4 w-4 ml-2" />
                                الإعدادات
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-[var(--color-error)]"
                            >
                                <LogOut className="h-4 w-4 ml-2" />
                                تسجيل الخروج
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
        </TooltipProvider>
    );
}
