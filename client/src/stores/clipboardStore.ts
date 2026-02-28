import { create } from 'zustand';
import { CLIPBOARD_MAX_HISTORY } from '@nexus/shared';
import {
  ClipboardEntry,
  loadClipboardHistory,
  saveClipboardHistory,
} from '../modules/clipboard/services/clipboardStorage';

interface ClipboardState {
  readonly history: readonly ClipboardEntry[];
  readonly isSyncing: boolean;
  readonly loaded: boolean;

  readonly initHistory: () => Promise<void>;
  readonly addEntry: (entry: ClipboardEntry) => Promise<void>;
  readonly removeEntry: (id: string) => Promise<void>;
  readonly clearHistory: () => Promise<void>;
  readonly setSyncing: (syncing: boolean) => void;
}

export const useClipboardStore = create<ClipboardState>((set, get) => ({
  history: [],
  isSyncing: false,
  loaded: false,

  initHistory: async () => {
    const history = await loadClipboardHistory();
    set({ history, loaded: true });
  },

  addEntry: async (entry) => {
    const current = get().history;
    const next = [entry, ...current].slice(0, CLIPBOARD_MAX_HISTORY);
    await saveClipboardHistory(next);
    set({ history: next });
  },

  removeEntry: async (id) => {
    const next = get().history.filter((e) => e.id !== id);
    await saveClipboardHistory(next);
    set({ history: next });
  },

  clearHistory: async () => {
    await saveClipboardHistory([]);
    set({ history: [] });
  },

  setSyncing: (syncing) => {
    set({ isSyncing: syncing });
  },
}));
