import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../../utils/logger';

const STORAGE_KEY = '@nexus/last_server';

interface SavedServer {
  readonly host: string;
  readonly port: number;
}

export async function loadLastServer(): Promise<SavedServer | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedServer;
    if (typeof parsed.host !== 'string' || typeof parsed.port !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    logger.error('serverStorage', 'failed to load last server');
    return null;
  }
}

export async function saveLastServer(host: string, port: number): Promise<void> {
  try {
    const data: SavedServer = { host, port };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    logger.error('serverStorage', 'failed to save last server');
  }
}

export async function clearLastServer(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    logger.error('serverStorage', 'failed to clear last server');
  }
}
