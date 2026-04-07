import { useState, useMemo, useCallback, type ReactNode } from "react";
import { AuthContext } from "@/contexts";
import type { UserInterface } from "@/interfaces";
import { storageKeys, getStorageItem, setStorageItem, removeStorageItem } from "@/utils";
import { DEMO_PASSWORD } from "@/data";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserInterface | null>(() => {
        const stored = getStorageItem<UserInterface>(storageKeys.authUser);
        // Clear stale cached user from previous version
        if (stored && stored.name !== "سارة السعداوي") {
            removeStorageItem(storageKeys.authUser);
            return null;
        }
        return stored;
    });

    const onLogin = useCallback((email: string, password: string): boolean => {
        if (password !== DEMO_PASSWORD) return false;

        const adminUser: UserInterface = {
            id: "admin-001",
            name: "سارة السعداوي",
            email,
            role: "مسؤولة تقييم وإدارة الأداء - إدارة الموارد البشرية",
            avatar: "سس",
        };

        setStorageItem(storageKeys.authUser, adminUser);
        setUser(adminUser);
        return true;
    }, []);

    const onLogout = useCallback(() => {
        removeStorageItem(storageKeys.authUser);
        setUser(null);
    }, []);

    const onUpdateUser = useCallback(
        (data: Partial<UserInterface>) => {
            if (!user) return;
            const updated = { ...user, ...data };
            setStorageItem(storageKeys.authUser, updated);
            setUser(updated);
        },
        [user]
    );

    const value = useMemo(
        () => ({
            isAuthenticated: !!user,
            user,
            onLogin,
            onLogout,
            onUpdateUser,
        }),
        [user, onLogin, onLogout, onUpdateUser]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
