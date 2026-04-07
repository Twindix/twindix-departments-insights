import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks";

export function OfflineBanner() {
    const isOnline = useOnlineStatus();

    if (isOnline) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-warning)] px-4 py-2 text-center text-sm font-medium text-white shadow-lg">
            <div className="flex items-center justify-center gap-2">
                <WifiOff className="h-4 w-4" />
                <span>
                    أنت غير متصل بالإنترنت. بعض الميزات قد لا تكون متاحة.
                </span>
            </div>
        </div>
    );
}
