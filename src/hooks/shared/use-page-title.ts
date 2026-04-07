import { useEffect } from "react";
import { APP_NAME_AR } from "@/data";

export function usePageTitle(pageTitle?: string) {
    useEffect(() => {
        document.title = pageTitle ? `${APP_NAME_AR} | ${pageTitle}` : APP_NAME_AR;
        return () => { document.title = APP_NAME_AR; };
    }, [pageTitle]);
}
