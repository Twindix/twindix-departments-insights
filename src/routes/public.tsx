import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks";
import { routesData } from "@/data";

export function PublicRoute() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to={routesData.dashboard} replace />;
    }

    return <Outlet />;
}
