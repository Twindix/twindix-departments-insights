export function ProjectQualitySkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-64 rounded-lg bg-[var(--color-surface)] animate-pulse" />
                    <div className="h-4 w-48 rounded-lg bg-[var(--color-surface)] animate-pulse" />
                </div>
                <div className="h-10 w-32 rounded-xl bg-[var(--color-surface)] animate-pulse" />
            </div>
            <div className="h-12 w-full rounded-xl bg-[var(--color-surface)] animate-pulse" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 rounded-xl bg-[var(--color-surface)] animate-pulse" />
                ))}
            </div>
            <div className="h-72 rounded-xl bg-[var(--color-surface)] animate-pulse" />
        </div>
    );
}
