import { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, X } from "lucide-react";
import { Card, CardContent, Button, Badge } from "@/atoms";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/ui";
import { DataTable } from "@/components/shared";
import { formatUsdAsSar } from "@/utils";
import type { CostData, ChangeOrder } from "@/data/seed";

interface ChangeOrdersTabProps {
    data: CostData;
}

const STATUS_VARIANTS: Record<ChangeOrder["status"], "default" | "secondary" | "destructive" | "outline"> = {
    "معتمد": "default",
    "قيد التنفيذ": "secondary",
    "منجز": "outline",
    "مرفوض": "destructive",
};

export function ChangeOrdersTab({ data }: ChangeOrdersTabProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const statusFilter = searchParams.get("co-status") || "all";

    const setStatusFilter = useCallback((v: string) => {
        setSearchParams((prev) => {
            if (v === "all") prev.delete("co-status");
            else prev.set("co-status", v);
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const filtered = useMemo(() => {
        if (statusFilter === "all") return data.changeOrders;
        return data.changeOrders.filter((c) => c.status === statusFilter);
    }, [data.changeOrders, statusFilter]);

    const columns = [
        { key: "id", header: "#", render: (c: ChangeOrder) => <span className="tabular-nums">{c.id}</span>, className: "w-8" },
        { key: "description", header: "الوصف", render: (c: ChangeOrder) => <span className="font-medium">{c.description}</span> },
        { key: "reason", header: "السبب", render: (c: ChangeOrder) => <span className="text-[var(--color-text-muted)] text-xs">{c.reason}</span> },
        {
            key: "value",
            header: "القيمة",
            render: (c: ChangeOrder) => <span className="tabular-nums font-semibold">{formatUsdAsSar(c.value, { compact: true })}</span>,
            className: "text-end",
        },
        {
            key: "timeImpact",
            header: "أثر زمني",
            render: (c: ChangeOrder) => <span className="tabular-nums">{c.timeImpactDays} يوم</span>,
            className: "text-end",
        },
        { key: "approver", header: "المعتمد", render: (c: ChangeOrder) => <span className="text-xs">{c.approver}</span> },
        {
            key: "status",
            header: "الحالة",
            render: (c: ChangeOrder) => <Badge variant={STATUS_VARIANTS[c.status]}>{c.status}</Badge>,
        },
    ];

    const totalImpact = filtered.reduce((s, c) => s + c.value, 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
                        <Filter className="h-4 w-4" />
                        تصفية
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 w-[180px] text-sm">
                            <SelectValue placeholder="الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">جميع الحالات</SelectItem>
                            <SelectItem value="معتمد">معتمد</SelectItem>
                            <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                            <SelectItem value="منجز">منجز</SelectItem>
                            <SelectItem value="مرفوض">مرفوض</SelectItem>
                        </SelectContent>
                    </Select>
                    {statusFilter !== "all" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStatusFilter("all")}
                            className="gap-1 text-[var(--color-error)]"
                        >
                            <X className="h-3.5 w-3.5" />
                            مسح
                        </Button>
                    )}
                </div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                    إجمالي الأثر المالي:{" "}
                    <span className="font-semibold tabular-nums text-[var(--color-text-primary)]">
                        {formatUsdAsSar(totalImpact, { compact: true })}
                    </span>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <DataTable columns={columns} data={filtered} emptyMessage="لا توجد أوامر تغيير" />
                </CardContent>
            </Card>
        </div>
    );
}
