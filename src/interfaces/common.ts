export interface UserInterface {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    departmentId?: string;
}

export interface AuthContextInterface {
    isAuthenticated: boolean;
    user: UserInterface | null;
    onLogin: (email: string, password: string) => boolean;
    onLogout: () => void;
    onUpdateUser: (data: Partial<UserInterface>) => void;
}

export interface ThemeContextInterface {
    isDarkMode: boolean;
    onToggleTheme: () => void;
}
