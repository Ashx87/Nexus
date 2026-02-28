import AsyncStorage from '@react-native-async-storage/async-storage';
import { MacroDefinition } from '@nexus/shared';
import { PRESET_SHORTCUTS } from '../constants/presets';

const STORAGE_KEY = '@nexus/macros';

export async function loadMacros(): Promise<readonly MacroDefinition[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (raw === null) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(PRESET_SHORTCUTS));
    return [...PRESET_SHORTCUTS];
  }

  const parsed: MacroDefinition[] = JSON.parse(raw);
  return [...parsed];
}

export async function saveMacros(macros: readonly MacroDefinition[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(macros));
}
