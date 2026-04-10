import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-[var(--color-primary)] text-white",
                secondary:
                    "border-transparent bg-[var(--color-surface)] text-[var(--color-text-secondary)]",
                success:
                    "border-transparent bg-[var(--color-success-light)] text-[var(--color-success)]",
                warning:
                    "border-transparent bg-[var(--color-warning-light)] text-[var(--color-warning)]",
                destructive:
                    "border-transparent bg-[var(--color-error-light)] text-[var(--color-error)]",
                outline:
                    "border-[var(--color-border)] text-[var(--color-text-secondary)]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
