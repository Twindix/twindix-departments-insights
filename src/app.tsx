import { RouterProvider } from "react-router-dom";
import { ErrorBoundary, OfflineBanner } from "@/components/shared";
import { ThemeProvider, AuthProvider } from "@/providers";
import { Toaster } from "@/ui";
import { router } from "@/routes";

export function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <RouterProvider router={router} />
                    <Toaster />
                    <OfflineBanner />
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}
