import { create } from "zustand";

interface SidebarStore {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
    isOpen: true,
    onToggle: () => set((state) => ({ isOpen: !state.isOpen })),
    onClose: () => set({ isOpen: false }),
}));
