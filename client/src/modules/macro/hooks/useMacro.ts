import { MacroDefinition } from '@nexus/shared';

export function useMacro() {
  return {
    executeMacro: (_macro: MacroDefinition) => {},
    createMacro: async (_macro: MacroDefinition) => {},
    updateMacro: async (_macro: MacroDefinition) => {},
    deleteMacro: async (_macroId: string) => {},
  };
}
