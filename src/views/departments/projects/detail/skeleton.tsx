export function ProjectDetailSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-64 rounded-lg bg-[var(--color-surface)] animate-pulse" />
                    <div className="h-4 w-48 rounded-lg bg-[var(--color-surface)] animate-pulse" />
                </div>
                <div className="h-10 w-32 rounded-xl bg-[var(--color-surface)] animate-pulse" />
            </div>

            {/* Info card */}
            <div className="h-64 rounded-xl bg-[var(--color-surface)] animate-pulse" />

            {/* 3 indicator cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-72 rounded-xl bg-[var(--color-surface)] animate-pulse"
                        style={{ animationDelay: `${i * 0.05}s` }}
                    />
                ))}
            </div>

            {/* Overall bar */}
            <div className="h-20 rounded-xl bg-[var(--color-surface)] animate-pulse" />
        </div>
    );
}
