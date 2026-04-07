import { Outlet } from "react-router-dom";
import { APP_VERSION, APP_NAME_AR } from "@/data";

export function AuthLayout() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] p-4">
            <div className="w-full max-w-md animate-fade-in">
                <Outlet />
            </div>
            <footer className="mt-8 text-center text-sm text-[var(--color-text-muted)] animate-fade-in" style={{ animationDelay: "0.6s" }}>
                <p>
                    {APP_NAME_AR} v{APP_VERSION}
                </p>
                <p className="mt-1">
                    طُوّر بواسطة <a href="https://twindix.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline" dir="ltr">Twindix Global Inc.</a>
                </p>
            </footer>
        </div>
    );
}
