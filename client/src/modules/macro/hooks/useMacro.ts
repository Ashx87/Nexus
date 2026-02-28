import { useCallback, useEffect } from 'react';
import { MacroDefinition, MacroExecuteMessage } from '@nexus/shared';
import { wsService } from '../../../services/WebSocketService';
import { useMacroStore } from '../../../stores/macroStore';

export function useMacro() {
  const addMacro = useMacroStore((s) => s.addMacro);
  const updateMacroInStore = useMacroStore((s) => s.updateMacro);
  const deleteMacroFromStore = useMacroStore((s) => s.deleteMacro);
  const setExecuting = useMacroStore((s) => s.setExecuting);

  const executeMacro = useCallback(
    (macro: MacroDefinition) => {
      setExecuting(macro.macroId, true);
      const msg: MacroExecuteMessage = {
        module: 'macro',
        action: 'execute',
        payload: { macroId: macro.macroId, steps: [...macro.steps] },
      };
      wsService.send(msg);
    },
    [setExecuting],
  );

  const createMacro = useCallback(
    async (macro: MacroDefinition) => {
      await addMacro(macro);
    },
    [addMacro],
  );

  const updateMacro = useCallback(
    async (macro: MacroDefinition) => {
      await updateMacroInStore(macro);
    },
    [updateMacroInStore],
  );

  const deleteMacro = useCallback(
    async (macroId: string) => {
      await deleteMacroFromStore(macroId);
    },
    [deleteMacroFromStore],
  );

  useEffect(() => {
    const unsubscribe = wsService.addMessageHandler((msg) => {
      if (msg.module === 'macro' && msg.action === 'result') {
        const payload = msg.payload as { macroId: string; success: boolean; error?: string };
        setExecuting(payload.macroId, false);
      }
    });
    return unsubscribe;
  }, [setExecuting]);

  return { executeMacro, createMacro, updateMacro, deleteMacro } as const;
}
