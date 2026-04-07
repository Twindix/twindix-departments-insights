import { createBrowserRouter } from "react-router-dom";
import { routesData } from "@/data";
import { ProtectedRoute } from "./protected";
import { PublicRoute } from "./public";
import { AuthLayout, DashboardLayout } from "@/layouts";
import { RouteError } from "./error";
import {
    LoginView,
    DashboardView,
    HrDepartmentView,
    MemberProfileView,
    MemberInsightsView,
    SettingsView,
    ProfileView,
    NotFoundView,
    ServerErrorView,
} from "@/views";

export const router = createBrowserRouter([
    {
        element: <PublicRoute />,
        errorElement: <RouteError />,
        children: [
            {
                element: <AuthLayout />,
                children: [
                    { path: routesData.login, element: <LoginView /> },
                ],
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        errorElement: <RouteError />,
        children: [
            {
                element: <DashboardLayout />,
                errorElement: <RouteError />,
                children: [
                    {
                        path: routesData.dashboard,
                        element: <DashboardView />,
                        errorElement: <RouteError />,
                    },
                    {
                        path: routesData.departmentHr,
                        element: <HrDepartmentView />,
                        errorElement: <RouteError />,
                    },
                    {
                        path: routesData.memberProfile,
                        element: <MemberProfileView />,
                        errorElement: <RouteError />,
                    },
                    {
                        path: routesData.memberInsights,
                        element: <MemberInsightsView />,
                        errorElement: <RouteError />,
                    },
                    {
                        path: routesData.settings,
                        element: <SettingsView />,
                        errorElement: <RouteError />,
                    },
                    {
                        path: routesData.profile,
                        element: <ProfileView />,
                        errorElement: <RouteError />,
                    },
                ],
            },
        ],
    },
    { path: "/500", element: <ServerErrorView /> },
    { path: "*", element: <NotFoundView /> },
]);
