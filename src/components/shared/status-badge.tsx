import { Badge } from "@/atoms";

interface StatusBadgeProps {
    score: number;
    className?: string;
}

function getStatusInfo(score: number): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
} {
    if (score >= 90) return { label: "ممتاز", variant: "success" };
    if (score >= 80) return { label: "جيد جداً", variant: "success" };
    if (score >= 70) return { label: "جيد", variant: "warning" };
    if (score >= 60) return { label: "مقبول", variant: "warning" };
    return { label: "ضعيف", variant: "destructive" };
}

export function StatusBadge({ score, className }: StatusBadgeProps) {
    const { label, variant } = getStatusInfo(score);
    return (
        <Badge variant={variant} className={className}>
            {label}
        </Badge>
    );
}
