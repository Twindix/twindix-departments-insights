const PREFIX = "twindix_dept_";

export const storageKeys = {
    authUser: `${PREFIX}auth_user`,
    theme: `${PREFIX}theme`,
    settings: `${PREFIX}settings`,
} as const;

export function getStorageItem<T>(key: string): T | null {
    try {
        const item = localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : null;
    } catch {
        return null;
    }
}

export function setStorageItem<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Failed to set storage item "${key}":`, error);
    }
}

export function removeStorageItem(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Failed to remove storage item "${key}":`, error);
    }
}
