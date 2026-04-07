import { useState, useCallback } from "react";
import { getStorageItem, setStorageItem } from "@/utils";

export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        const item = getStorageItem<T>(key);
        return item ?? initialValue;
    });

    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            setStoredValue((prev) => {
                const newValue =
                    value instanceof Function ? value(prev) : value;
                setStorageItem(key, newValue);
                return newValue;
            });
        },
        [key]
    );

    return [storedValue, setValue];
}
