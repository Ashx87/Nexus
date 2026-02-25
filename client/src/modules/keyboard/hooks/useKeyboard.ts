import { useCallback } from 'react';
import { wsService } from '../../../services/WebSocketService';
import { useKeyboardStore } from '../../../stores/keyboardStore';
import type {
  KeyboardTypeMessage,
  KeyboardKeyMessage,
  KeyboardComboMessage,
} from '@nexus/shared';

export function useKeyboard() {
  const { lockedModifiers, toggleModifier, clearModifiers } = useKeyboardStore();

  const sendType = useCallback((text: string) => {
    const msg: KeyboardTypeMessage = {
      module: 'keyboard',
      action: 'type',
      payload: { text },
    };
    wsService.send(msg);
  }, []);

  const sendKey = useCallback(
    (key: string) => {
      const locked = Array.from(lockedModifiers);
      if (locked.length > 0) {
        // Modifier(s) locked → fire as combo, keep modifiers locked
        const msg: KeyboardComboMessage = {
          module: 'keyboard',
          action: 'combo',
          payload: { keys: [...locked, key] },
        };
        wsService.send(msg);
      } else {
        const msg: KeyboardKeyMessage = {
          module: 'keyboard',
          action: 'key',
          payload: { key },
        };
        wsService.send(msg);
      }
    },
    [lockedModifiers],
  );

  const sendCombo = useCallback((keys: string[]) => {
    const msg: KeyboardComboMessage = {
      module: 'keyboard',
      action: 'combo',
      payload: { keys },
    };
    wsService.send(msg);
  }, []);

  return {
    sendType,
    sendKey,
    sendCombo,
    lockedModifiers,
    toggleModifier,
    clearModifiers,
  } as const;
}
