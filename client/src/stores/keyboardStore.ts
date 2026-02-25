import { create } from 'zustand';

interface KeyboardState {
  readonly lockedModifiers: ReadonlySet<string>;
  readonly toggleModifier: (key: string) => void;
  readonly clearModifiers: () => void;
  readonly isModifierLocked: (key: string) => boolean;
}

export const useKeyboardStore = create<KeyboardState>((set, get) => ({
  lockedModifiers: new Set(),

  toggleModifier: (key) =>
    set((state) => ({
      lockedModifiers: state.lockedModifiers.has(key)
        ? new Set([...state.lockedModifiers].filter((k) => k !== key))
        : new Set([...state.lockedModifiers, key]),
    })),

  clearModifiers: () => set({ lockedModifiers: new Set() }),

  isModifierLocked: (key) => get().lockedModifiers.has(key),
}));
