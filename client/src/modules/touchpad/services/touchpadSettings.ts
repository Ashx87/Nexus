import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../../utils/logger';

const STORAGE_KEY = '@nexus/touchpad_settings';

interface TouchpadSettings {
  readonly sensitivity: number;
}

const DEFAULTS: TouchpadSettings = { sensitivity: 1.0 };

export async function loadTouchpadSettings(): Promise<TouchpadSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<TouchpadSettings>;
    return {
      sensitivity:
        typeof parsed.sensitivity === 'number' &&
        parsed.sensitivity >= 0.3 &&
        parsed.sensitivity <= 3.0
          ? parsed.sensitivity
          : DEFAULTS.sensitivity,
    };
  } catch {
    logger.error('touchpadSettings', 'failed to load settings');
    return DEFAULTS;
  }
}

export async function saveTouchpadSettings(settings: TouchpadSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    logger.error('touchpadSettings', 'failed to save settings');
  }
}
