import { create } from 'zustand';

interface LightboxState {
  isLightboxOpen: boolean;
  setLightboxOpen: (open: boolean) => void;
}

export const useLightboxStore = create<LightboxState>((set) => ({
  isLightboxOpen: false,
  setLightboxOpen: (open) => set({ isLightboxOpen: open }),
}));
