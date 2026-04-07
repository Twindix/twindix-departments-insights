import { LayoutDashboard, Users, Settings } from "lucide-react";
import { routesData } from "./routes";

export interface SidebarItem {
    label: string;
    path: string;
    icon: typeof LayoutDashboard;
}

export const sidebarItems: SidebarItem[] = [
    {
        label: "لوحة التحكم",
        path: routesData.dashboard,
        icon: LayoutDashboard,
    },
    {
        label: "الموارد البشرية",
        path: routesData.departmentHr,
        icon: Users,
    },
    {
        label: "الإعدادات",
        path: routesData.settings,
        icon: Settings,
    },
];
