import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils";

const Input = forwardRef<
    HTMLInputElement,
    InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
    <input
        type={type}
        className={cn(
            "flex h-10 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            className,
        )}
        ref={ref}
        {...props}
    />
));
Input.displayName = "Input";

export { Input };
