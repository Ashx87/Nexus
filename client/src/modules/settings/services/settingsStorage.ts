import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../../utils/logger';

const STORAGE_KEY = '@nexus/settings';

export type AppTheme = 'light' | 'dark' | 'system';

export interface AppSettings {
  readonly theme: AppTheme;
  readonly serverPort: number;
}

const DEFAULTS: AppSettings = { theme: 'system', serverPort: 9001 };

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      theme: (['light', 'dark', 'system'] as const).includes(parsed.theme as AppTheme)
        ? (parsed.theme as AppTheme)
        : DEFAULTS.theme,
      serverPort:
        typeof parsed.serverPort === 'number' &&
        parsed.serverPort >= 1024 &&
        parsed.serverPort <= 65535
          ? parsed.serverPort
          : DEFAULTS.serverPort,
    };
  } catch {
    logger.error('settingsStorage', 'failed to load settings');
    return DEFAULTS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    logger.error('settingsStorage', 'failed to save settings');
  }
}
