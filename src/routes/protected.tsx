import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks";
import { routesData } from "@/data";

export function ProtectedRoute() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to={routesData.login} replace />;
    }

    return <Outlet />;
}
