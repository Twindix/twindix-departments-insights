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
    HrPerformanceView,
    ProjectsView,
    ProjectDetailView,
    ProjectCostView,
    ProjectQualityView,
    ProjectTimeView,
    FinanceView,
    EmployeeProfileView,
    EmployeeInsightsView,
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
                        path: routesData.departmentHrPerformance,
                        element: <HrPerformanceView />,
                        errorElement: <RouteError />,
                    },
                    {
                        path: routesData.departmentProjects,
                        element: <ProjectsView />,
                        errorElement: <RouteError />,
                    },
                    {
                        path: routesData.departmentProjectDetail,
                        element: <ProjectDetailView />,
                        errorElement: <RouteError />,
                    },
                    {
                        path: routesData.departmentProjectCost,
                        element: <ProjectCostView />,
                        errorElement: <RouteError />,
                    },
                    {
                        path: routesData.departmentProjectQuality,
                        element: <ProjectQualityView />,
                        errorElement: <RouteError />,
                    },
                    {
                        path: routesData.departmentProjectTime,
                        element: <ProjectTimeView />,
                        errorElement: <RouteError />,
                    },
                    {
                        path: routesData.departmentFinance,
                        element: <FinanceView />,
                        errorElement: <RouteError />,
                    },
                    {
                        path: routesData.employeeProfile,
                        element: <EmployeeProfileView />,
                        errorElement: <RouteError />,
                    },
                    {
                        path: routesData.employeeInsights,
                        element: <EmployeeInsightsView />,
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
