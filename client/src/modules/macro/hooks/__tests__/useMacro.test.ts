/**
 * Tests for useMacro hook.
 *
 * Follows the same pattern as useMedia tests: mock react so useCallback is
 * an identity wrapper, mock wsService.send to capture outgoing messages,
 * and mock macroStore selectors.
 */

// ─── Mock expo modules (must be before any import that touches them) ────────
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(),
}));

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: '/tmp/test/',
  writeAsStringAsync: jest.fn(),
}));

// ─── Mock wsService ──────────────────────────────────────────────────────────
jest.mock('../../../../services/WebSocketService', () => ({
  wsService: { send: jest.fn(), addMessageHandler: jest.fn(() => jest.fn()) },
}));

// ─── Mock React hooks to be no-ops outside a render context ─────────────────
jest.mock('react', () => ({
  useCallback: (fn: unknown) => fn,
  useEffect: () => {},
}));

// ─── Mock macroStore ────────────────────────────────────────────────────────
jest.mock('../../../../stores/macroStore', () => {
  const addMacro = jest.fn();
  const updateMacro = jest.fn();
  const deleteMacro = jest.fn();
  const setExecuting = jest.fn();
  return {
    useMacroStore: (selector: (s: Record<string, unknown>) => unknown) =>
      selector({ addMacro, updateMacro, deleteMacro, setExecuting }),
    __mocks: { addMacro, updateMacro, deleteMacro, setExecuting },
  };
});

// ─── Imports (after mocks are registered) ───────────────────────────────────
import { wsService } from '../../../../services/WebSocketService';
import { useMacro } from '../useMacro';

const mockSend = wsService.send as jest.Mock;
const { __mocks } = require('../../../../stores/macroStore');

// ─── Reset between tests ────────────────────────────────────────────────────
beforeEach(() => {
  mockSend.mockClear();
  Object.values(__mocks).forEach((m: unknown) => (m as jest.Mock).mockClear());
});

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('useMacro', () => {
  const sampleMacro = {
    macroId: 'test-1',
    name: 'Test',
    icon: 'copy',
    color: '#000',
    steps: [{ type: 'key_combo' as const, keys: ['ctrl', 'c'], delay: 0 }],
    isPreset: false,
    order: 0,
  };

  describe('executeMacro', () => {
    test('sends MacroExecuteMessage with macroId and steps', () => {
      const { executeMacro } = useMacro();
      executeMacro(sampleMacro);
      expect(mockSend).toHaveBeenCalledWith({
        module: 'macro',
        action: 'execute',
        payload: { macroId: 'test-1', steps: sampleMacro.steps },
      });
    });

    test('calls setExecuting(macroId, true) before sending', () => {
      const { executeMacro } = useMacro();
      executeMacro(sampleMacro);
      expect(__mocks.setExecuting).toHaveBeenCalledWith('test-1', true);
    });
  });

  describe('createMacro', () => {
    test('delegates to store addMacro', async () => {
      const { createMacro } = useMacro();
      await createMacro(sampleMacro);
      expect(__mocks.addMacro).toHaveBeenCalledWith(sampleMacro);
    });
  });

  describe('updateMacro', () => {
    test('delegates to store updateMacro', async () => {
      const { updateMacro } = useMacro();
      await updateMacro(sampleMacro);
      expect(__mocks.updateMacro).toHaveBeenCalledWith(sampleMacro);
    });
  });

  describe('deleteMacro', () => {
    test('delegates to store deleteMacro', async () => {
      const { deleteMacro } = useMacro();
      await deleteMacro('test-1');
      expect(__mocks.deleteMacro).toHaveBeenCalledWith('test-1');
    });
  });
});
