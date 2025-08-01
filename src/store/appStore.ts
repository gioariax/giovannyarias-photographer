import { create } from 'zustand';

interface AppState {
  showBlur: boolean;
  showHeader: boolean;
  setShowBlur: (show: boolean) => void;
  setShowHeader: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  showBlur: false,
  setShowBlur: (show) => set({ showBlur: show }),
  showHeader: true,
  setShowHeader: (show) => set({ showHeader: show }),
}));
