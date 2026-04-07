import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils";

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    min?: string;
    max?: string;
    disabled?: boolean;
    label?: string;
}

export function DatePicker({ value, onChange, min, max, disabled, label }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selectedDate = value ? new Date(value + "T00:00:00") : undefined;
    const minDate = min ? new Date(min + "T00:00:00") : undefined;
    const maxDate = max ? new Date(max + "T00:00:00") : undefined;

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const handleSelect = (day: Date | undefined) => {
        if (!day) return;
        const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
        onChange(iso);
        setOpen(false);
    };

    const displayValue = selectedDate
        ? selectedDate.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })
        : "اختر تاريخ";

    return (
        <div ref={ref} className="relative flex-1 min-w-0">
            {label && <span className="text-xs text-[var(--color-text-muted)] mb-1 block">{label}</span>}
            <button
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className={cn(
                    "flex items-center gap-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm transition-all cursor-pointer",
                    "hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none",
                    disabled && "opacity-40 cursor-not-allowed hover:border-[var(--color-border)]",
                    open && "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]"
                )}
            >
                <CalendarDays className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
                <span className={cn(
                    "flex-1 text-right tabular-nums",
                    value ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"
                )}>
                    {displayValue}
                </span>
            </button>

            {open && (
                <div className="absolute top-full mt-2 z-50 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-xl animate-scale-in" style={{ left: 0, minWidth: 280 }}>
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSelect}
                        defaultMonth={selectedDate}
                        disabled={[
                            ...(minDate ? [{ before: minDate }] : []),
                            ...(maxDate ? [{ after: maxDate }] : []),
                        ]}
                        components={{
                            Chevron: ({ orientation }) =>
                                orientation === "left"
                                    ? <ChevronLeft className="h-4 w-4" />
                                    : <ChevronRight className="h-4 w-4" />,
                        }}
                        classNames={{
                            root: "p-3",
                            months: "flex flex-col",
                            month: "space-y-3",
                            month_caption: "flex items-center justify-center",
                            caption_label: "text-sm font-semibold text-[var(--color-text-dark)]",
                            nav: "flex items-center gap-1",
                            button_previous: "h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] cursor-pointer transition-colors",
                            button_next: "h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] cursor-pointer transition-colors",
                            weekdays: "flex",
                            weekday: "w-9 text-center text-xs font-medium text-[var(--color-text-muted)] py-1",
                            week: "flex",
                            day: "p-0",
                            day_button: "h-9 w-9 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]",
                            selected: "!bg-[var(--color-primary)] !text-white !rounded-lg !font-semibold",
                            today: "font-bold text-[var(--color-primary)]",
                            outside: "text-[var(--color-text-muted)] opacity-40",
                            disabled: "text-[var(--color-text-muted)] opacity-30 cursor-not-allowed hover:bg-transparent",
                            range_start: "rounded-r-lg",
                            range_end: "rounded-l-lg",
                        }}
                    />
                </div>
            )}
        </div>
    );
}
