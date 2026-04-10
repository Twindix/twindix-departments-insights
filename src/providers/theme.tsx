import { useState, useEffect, useMemo, type ReactNode } from "react";
import { ThemeContext } from "@/contexts";
import { Theme } from "@/enums";
import { storageKeys, getStorageItem, setStorageItem } from "@/utils";

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = getStorageItem<Theme>(storageKeys.theme);
        if (stored) return stored;

        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? Theme.Dark
            : Theme.Light;
    });

    useEffect(() => {
        const root = document.documentElement;

        if (theme === Theme.Dark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        setStorageItem(storageKeys.theme, theme);
    }, [theme]);

    const value = useMemo(
        () => ({
            isDarkMode: theme === Theme.Dark,
            onToggleTheme: () =>
                setTheme((prev) =>
                    prev === Theme.Dark ? Theme.Light : Theme.Dark,
                ),
        }),
        [theme],
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}
