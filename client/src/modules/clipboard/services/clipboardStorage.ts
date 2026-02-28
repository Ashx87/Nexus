import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClipboardDirection } from '@nexus/shared';

export interface ClipboardEntry {
  readonly id: string;
  readonly type: 'text' | 'image';
  readonly content: string;
  readonly preview: string;
  readonly direction: ClipboardDirection;
  readonly timestamp: number;
}

const STORAGE_KEY = '@nexus/clipboard-history';

export async function loadClipboardHistory(): Promise<readonly ClipboardEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return [];
  }
  return JSON.parse(raw) as ClipboardEntry[];
}

export async function saveClipboardHistory(entries: readonly ClipboardEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
