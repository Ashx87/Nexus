/**
 * Tests for useClipboard hook.
 *
 * Follows the same pattern as useMacro tests: mock react so useCallback is
 * an identity wrapper, capture useEffect callbacks, mock wsService and
 * clipboardStore selectors.
 */

// ─── Mock expo-clipboard (must be before any import that touches it) ─────────
const mockGetStringAsync = jest.fn().mockResolvedValue('phone text');
const mockSetStringAsync = jest.fn().mockResolvedValue(true);
jest.mock('expo-clipboard', () => ({
  getStringAsync: (...args: unknown[]) => mockGetStringAsync(...args),
  setStringAsync: (...args: unknown[]) => mockSetStringAsync(...args),
}));

// ─── Mock wsService ──────────────────────────────────────────────────────────
const mockSend = jest.fn();
const mockUnsubscribe = jest.fn();
const mockAddMessageHandler = jest.fn().mockReturnValue(mockUnsubscribe);
jest.mock('../../../../services/WebSocketService', () => ({
  wsService: {
    send: (...args: unknown[]) => mockSend(...args),
    addMessageHandler: (...args: unknown[]) => mockAddMessageHandler(...args),
  },
}));

// ─── Mock React hooks ────────────────────────────────────────────────────────
// Capture useEffect callbacks so we can invoke them manually in tests
const effectCallbacks: Array<() => (() => void) | void> = [];
jest.mock('react', () => ({
  useCallback: (fn: unknown) => fn,
  useEffect: (fn: () => (() => void) | void) => {
    effectCallbacks.push(fn);
  },
}));

// ─── Mock clipboardStore ────────────────────────────────────────────────────
const mockAddEntry = jest.fn().mockResolvedValue(undefined);
const mockSetSyncing = jest.fn();
jest.mock('../../../../stores/clipboardStore', () => ({
  useClipboardStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      addEntry: mockAddEntry,
      setSyncing: mockSetSyncing,
      history: [],
      isSyncing: false,
    }),
}));

// ─── Imports (after mocks are registered) ────────────────────────────────────
import { useClipboard } from '../useClipboard';

// ─── Reset between tests ────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  effectCallbacks.length = 0;
});

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('useClipboard', () => {
  describe('sendToPC', () => {
    test('reads phone clipboard and sends ClipboardSyncMessage', async () => {
      const { sendToPC } = useClipboard();

      await sendToPC();

      expect(mockGetStringAsync).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith({
        module: 'clipboard',
        action: 'sync',
        payload: { content: 'phone text', direction: 'phone_to_pc' },
      });
    });

    test('sets syncing true then false around send', async () => {
      const { sendToPC } = useClipboard();

      await sendToPC();

      expect(mockSetSyncing).toHaveBeenCalledWith(true);
      expect(mockSetSyncing).toHaveBeenCalledWith(false);
    });

    test('adds entry to history after sending', async () => {
      const { sendToPC } = useClipboard();

      await sendToPC();

      expect(mockAddEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text',
          content: 'phone text',
          direction: 'phone_to_pc',
        }),
      );
    });

    test('does nothing when clipboard is empty', async () => {
      mockGetStringAsync.mockResolvedValueOnce('');
      const { sendToPC } = useClipboard();

      await sendToPC();

      expect(mockSend).not.toHaveBeenCalled();
      expect(mockSetSyncing).not.toHaveBeenCalled();
    });
  });

  describe('getFromPC', () => {
    test('sends ClipboardRequestMessage', () => {
      const { getFromPC } = useClipboard();

      getFromPC();

      expect(mockSend).toHaveBeenCalledWith({
        module: 'clipboard',
        action: 'request',
        payload: { direction: 'pc_to_phone' },
      });
    });

    test('sets syncing to true', () => {
      const { getFromPC } = useClipboard();

      getFromPC();

      expect(mockSetSyncing).toHaveBeenCalledWith(true);
    });
  });

  describe('useEffect message handler', () => {
    test('registers a message handler via useEffect', () => {
      useClipboard();

      // useEffect was captured; invoke it to trigger addMessageHandler
      expect(effectCallbacks.length).toBeGreaterThan(0);
      effectCallbacks[0]();

      expect(mockAddMessageHandler).toHaveBeenCalledTimes(1);
      expect(typeof mockAddMessageHandler.mock.calls[0][0]).toBe('function');
    });

    test('useEffect cleanup returns unsubscribe', () => {
      useClipboard();

      const cleanup = effectCallbacks[0]();

      expect(typeof cleanup).toBe('function');
      (cleanup as () => void)();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    test('incoming pc_to_phone sync message writes to device clipboard', () => {
      useClipboard();
      effectCallbacks[0]();

      const handler = mockAddMessageHandler.mock.calls[0][0] as (msg: unknown) => void;

      handler({
        module: 'clipboard',
        action: 'sync',
        payload: { content: 'pc clipboard text', direction: 'pc_to_phone' },
      });

      expect(mockSetStringAsync).toHaveBeenCalledWith('pc clipboard text');
      expect(mockAddEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text',
          content: 'pc clipboard text',
          direction: 'pc_to_phone',
        }),
      );
      expect(mockSetSyncing).toHaveBeenCalledWith(false);
    });

    test('ignores messages from other modules', () => {
      useClipboard();
      effectCallbacks[0]();

      const handler = mockAddMessageHandler.mock.calls[0][0] as (msg: unknown) => void;

      handler({
        module: 'macro',
        action: 'result',
        payload: { macroId: 'test', success: true },
      });

      expect(mockSetStringAsync).not.toHaveBeenCalled();
      expect(mockAddEntry).not.toHaveBeenCalled();
    });
  });

  describe('return value', () => {
    test('exposes sendToPC and getFromPC functions', () => {
      const result = useClipboard();
      expect(typeof result.sendToPC).toBe('function');
      expect(typeof result.getFromPC).toBe('function');
    });
  });
});
