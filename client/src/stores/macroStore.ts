import { create } from 'zustand';
import { MacroDefinition } from '@nexus/shared';
import { loadMacros, saveMacros } from '../modules/macro/services/macroStorage';

interface MacroState {
  readonly macros: readonly MacroDefinition[];
  readonly isExecuting: Readonly<Record<string, boolean>>;
  readonly loaded: boolean;

  readonly initMacros: () => Promise<void>;
  readonly addMacro: (macro: MacroDefinition) => Promise<void>;
  readonly updateMacro: (macro: MacroDefinition) => Promise<void>;
  readonly deleteMacro: (macroId: string) => Promise<void>;
  readonly reorderMacros: (reordered: readonly MacroDefinition[]) => Promise<void>;
  readonly setExecuting: (macroId: string, executing: boolean) => void;
}

export const useMacroStore = create<MacroState>((set, get) => ({
  macros: [],
  isExecuting: {},
  loaded: false,

  initMacros: async () => {
    const macros = await loadMacros();
    set({ macros, loaded: true });
  },

  addMacro: async (macro) => {
    const next = [...get().macros, macro];
    await saveMacros(next);
    set({ macros: next });
  },

  updateMacro: async (macro) => {
    const next = get().macros.map((m) => (m.macroId === macro.macroId ? macro : m));
    await saveMacros(next);
    set({ macros: next });
  },

  deleteMacro: async (macroId) => {
    const next = get().macros.filter((m) => m.macroId !== macroId);
    await saveMacros(next);
    set({ macros: next });
  },

  reorderMacros: async (reordered) => {
    const updated = reordered.map((m, i) => ({ ...m, order: i }));
    await saveMacros(updated);
    set({ macros: updated });
  },

  setExecuting: (macroId, executing) => {
    const current = get().isExecuting;
    if (executing) {
      set({ isExecuting: { ...current, [macroId]: true } });
    } else {
      const { [macroId]: _, ...rest } = current;
      set({ isExecuting: rest });
    }
  },
}));
