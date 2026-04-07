import type { ReactNode } from "react";
import { cn } from "@/utils";

interface HeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
}

export function Header({ title, description, actions, className }: HeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                className
            )}
        >
            <div>
                <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        {description}
                    </p>
                )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}
