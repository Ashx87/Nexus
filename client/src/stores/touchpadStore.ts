import { create } from 'zustand';
import {
  loadTouchpadSettings,
  saveTouchpadSettings,
} from '../modules/touchpad/services/touchpadSettings';

interface TouchpadState {
  readonly sensitivity: number;
  readonly settingsLoaded: boolean;
  initSettings: () => Promise<void>;
  setSensitivity: (value: number) => void;
}

export const useTouchpadStore = create<TouchpadState>((set) => ({
  sensitivity: 1.0,
  settingsLoaded: false,

  initSettings: async () => {
    const settings = await loadTouchpadSettings();
    set({ sensitivity: settings.sensitivity, settingsLoaded: true });
  },

  setSensitivity: (value: number) => {
    const clamped = Math.max(0.3, Math.min(3.0, value));
    set({ sensitivity: clamped });
    void saveTouchpadSettings({ sensitivity: clamped });
  },
}));
