import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/utils";

export type SortDirection = "asc" | "desc" | null;

export interface SortState {
    key: string;
    direction: SortDirection;
}

interface Column<T> {
    key: string;
    header: string;
    render: (item: T, index: number) => React.ReactNode;
    className?: string;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (item: T) => void;
    className?: string;
    emptyMessage?: string;
    sortState?: SortState[];
    onSort?: (key: string) => void;
}

export function DataTable<T>({
    columns,
    data,
    onRowClick,
    className,
    emptyMessage = "لا توجد بيانات",
    sortState = [],
    onSort,
}: DataTableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="py-12 text-center text-[var(--color-text-muted)]">
                {emptyMessage}
            </div>
        );
    }

    const getSortDirection = (key: string): SortDirection => {
        const s = sortState.find((s) => s.key === key);
        return s?.direction ?? null;
    };

    const getSortIcon = (key: string) => {
        const dir = getSortDirection(key);
        if (dir === "asc") return <ArrowUp className="h-3 w-3" />;
        if (dir === "desc") return <ArrowDown className="h-3 w-3" />;
        return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    };

    return (
        <div className={cn("overflow-x-auto rounded-xl border border-[var(--color-border)] scrollbar-thin", className)}>
            <table className="w-full text-sm min-w-[600px]">
                <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={cn(
                                    "px-4 py-3 text-right font-semibold text-[var(--color-text-secondary)]",
                                    col.sortable && "cursor-pointer select-none hover:text-[var(--color-text-dark)] transition-colors",
                                    col.className,
                                )}
                                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                            >
                                <span className="flex items-center gap-1.5">
                                    {col.header}
                                    {col.sortable && onSort && (
                                        <span className={cn(
                                            "inline-flex",
                                            getSortDirection(col.key) && "text-[var(--color-primary)]",
                                        )}>
                                            {getSortIcon(col.key)}
                                        </span>
                                    )}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr
                            key={index}
                            onClick={() => onRowClick?.(item)}
                            className={cn(
                                "border-b border-[var(--color-border)] last:border-b-0 transition-colors",
                                onRowClick &&
                                    "cursor-pointer hover:bg-[var(--color-surface-hover)]",
                            )}
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className={cn(
                                        "px-4 py-3 text-[var(--color-text-primary)]",
                                        col.className,
                                    )}
                                >
                                    {col.render(item, index)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
