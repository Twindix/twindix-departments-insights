import { cn } from "@/utils";

interface Column<T> {
    key: string;
    header: string;
    render: (item: T, index: number) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (item: T) => void;
    className?: string;
    emptyMessage?: string;
}

export function DataTable<T>({
    columns,
    data,
    onRowClick,
    className,
    emptyMessage = "لا توجد بيانات",
}: DataTableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="py-12 text-center text-[var(--color-text-muted)]">
                {emptyMessage}
            </div>
        );
    }

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
                                    col.className
                                )}
                            >
                                {col.header}
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
                                    "cursor-pointer hover:bg-[var(--color-surface-hover)]"
                            )}
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className={cn(
                                        "px-4 py-3 text-[var(--color-text-primary)]",
                                        col.className
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
