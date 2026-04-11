import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/atoms";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/ui";

interface TablePaginationProps {
    totalItems: number;
    pageSize: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    pageSizeOptions?: number[];
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function TablePagination({
    totalItems,
    pageSize,
    currentPage,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: TablePaginationProps) {
    if (totalItems === 0) return null;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * pageSize + 1;
    const endIdx = Math.min(safePage * pageSize, totalItems);

    return (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[var(--color-border)] pt-3">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <span>عرض {startIdx} - {endIdx} من {totalItems}</span>
                <span className="text-[var(--color-border)]">|</span>
                <span>صفوف:</span>
                <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
                    <SelectTrigger className="h-8 w-[68px] text-xs cursor-pointer">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {pageSizeOptions.map((s) => (
                            <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage <= 1} onClick={() => onPageChange(1)}>
                    <ChevronsRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage <= 1} onClick={() => onPageChange(Math.max(1, safePage - 1))}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm font-medium tabular-nums">{safePage} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage >= totalPages} onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage >= totalPages} onClick={() => onPageChange(totalPages)}>
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
