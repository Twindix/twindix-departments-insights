import { useCallback, useEffect } from "react";
import { useLocalStorage } from "./use-local-storage";
import { storageKeys, formatDate as formatDateUtil } from "@/utils";

interface Settings {
    dateFormat: "short" | "long" | "iso";
    compactView: boolean;
}

const defaultSettings: Settings = {
    dateFormat: "short",
    compactView: false,
};

export function useSettings() {
    const [settings, setSettings] = useLocalStorage<Settings>(
        storageKeys.settings,
        defaultSettings,
    );

    // Sync compact mode class to <html>
    useEffect(() => {
        const root = document.documentElement;
        if (settings.compactView) {
            root.classList.add("compact");
        } else {
            root.classList.remove("compact");
        }
    }, [settings.compactView]);

    const onUpdateSettings = useCallback(
        (updates: Partial<Settings>) => {
            setSettings((prev) => ({ ...prev, ...updates }));
        },
        [setSettings],
    );

    const fmtDate = useCallback(
        (dateString: string, overrideFormat?: "short" | "long" | "iso") => {
            return formatDateUtil(dateString, overrideFormat ?? settings.dateFormat);
        },
        [settings.dateFormat],
    );

    return {
        ...settings,
        onUpdateSettings,
        formatDate: fmtDate,
    };
}
