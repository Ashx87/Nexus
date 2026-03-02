import { create } from 'zustand';
import type { AppTheme } from '../modules/settings/services/settingsStorage';
import { loadSettings, saveSettings } from '../modules/settings/services/settingsStorage';

interface SettingsState {
  readonly theme: AppTheme;
  readonly serverPort: number;
  readonly settingsLoaded: boolean;
  initSettings: () => Promise<void>;
  setTheme: (theme: AppTheme) => void;
  setServerPort: (port: number) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'system',
  serverPort: 9001,
  settingsLoaded: false,

  initSettings: async () => {
    const s = await loadSettings();
    set({ theme: s.theme, serverPort: s.serverPort, settingsLoaded: true });
  },

  setTheme: (theme) => {
    set({ theme });
    void saveSettings({ theme, serverPort: get().serverPort });
  },

  setServerPort: (port) => {
    const clamped = Math.max(1024, Math.min(65535, port));
    set({ serverPort: clamped });
    void saveSettings({ theme: get().theme, serverPort: clamped });
  },
}));
