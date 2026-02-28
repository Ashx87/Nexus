import { useCallback, useEffect } from 'react';
import { MacroDefinition, MacroExecuteMessage } from '@nexus/shared';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
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

  const exportMacro = useCallback(async (macro: MacroDefinition) => {
    const json = JSON.stringify(macro, null, 2);
    const fileName = macro.name.replace(/\s+/g, '_');
    const path = `${FileSystem.cacheDirectory}${fileName}.json`;
    await FileSystem.writeAsStringAsync(path, json);
    await Sharing.shareAsync(path, {
      mimeType: 'application/json',
      dialogTitle: `Share ${macro.name}`,
    });
  }, []);

  const importMacro = useCallback(async (json: string) => {
    const parsed = JSON.parse(json) as MacroDefinition;
    if (!parsed.macroId || !parsed.name || !Array.isArray(parsed.steps)) {
      throw new Error('Invalid macro format');
    }
    const macro: MacroDefinition = {
      ...parsed,
      macroId: `imported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      isPreset: false,
      order: useMacroStore.getState().macros.length,
    };
    await addMacro(macro);
    return macro;
  }, [addMacro]);

  useEffect(() => {
    const unsubscribe = wsService.addMessageHandler((msg) => {
      if (msg.module === 'macro' && msg.action === 'result') {
        const payload = msg.payload as { macroId: string; success: boolean; error?: string };
        setExecuting(payload.macroId, false);
      }
    });
    return unsubscribe;
  }, [setExecuting]);

  return { executeMacro, createMacro, updateMacro, deleteMacro, exportMacro, importMacro } as const;
}
