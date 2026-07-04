import { create } from 'zustand';

export type CanvasWidth = 'desktop' | 'tablet' | 'mobile';
export type CanvasTheme = 'light' | 'dark' | 'note';

interface CanvasState {
  width: CanvasWidth;
  theme: CanvasTheme;
  setWidth: (width: CanvasWidth) => void;
  setTheme: (theme: CanvasTheme) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  width: 'desktop',
  theme: 'light',
  setWidth: (width) => set({ width }),
  setTheme: (theme) => set({ theme }),
}));
