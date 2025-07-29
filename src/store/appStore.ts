import { create } from 'zustand';

interface AppState {
  showBlur: boolean;
  setShowBlur: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  showBlur: false,
  setShowBlur: (show) => set({ showBlur: show }),
}));
