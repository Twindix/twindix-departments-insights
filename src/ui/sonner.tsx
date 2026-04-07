import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/hooks";

export function Toaster() {
    const { isDarkMode } = useTheme();

    return (
        <SonnerToaster
            theme={isDarkMode ? "dark" : "light"}
            position="top-center"
            dir="rtl"
            toastOptions={{
                style: {
                    fontFamily: "var(--font-sans)",
                },
            }}
        />
    );
}
