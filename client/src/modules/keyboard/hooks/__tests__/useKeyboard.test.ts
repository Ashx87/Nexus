/**
 * Tests for useKeyboard hook.
 *
 * Because this runs outside a React rendering context (no renderHook available),
 * we mock:
 *   - `react` so that useCallback is a plain identity wrapper (no hooks context needed)
 *   - `useKeyboardStore` to delegate to the Zustand store's getState() instead of
 *     the React hook binding, while still exercising the real store logic
 *   - `wsService.send` to capture outgoing messages
 *
 * We access the real Zustand store instance via jest.requireActual so we can
 * call setState/getState directly for test setup and assertions.
 */

// ─── Mock wsService ──────────────────────────────────────────────────────────
jest.mock('../../../../services/WebSocketService', () => ({
  wsService: { send: jest.fn() },
}));

// ─── Mock React hooks to be no-ops outside a render context ─────────────────
jest.mock('react', () => ({
  useCallback: (fn: unknown) => fn,
}));

// ─── Mock useKeyboardStore to use getState() instead of the React hook ───────
jest.mock('../../../../stores/keyboardStore', () => {
  const actual = jest.requireActual<typeof import('../../../../stores/keyboardStore')>(
    '../../../../stores/keyboardStore',
  );
  return {
    ...actual,
    useKeyboardStore: Object.assign(
      () => actual.useKeyboardStore.getState(),
      actual.useKeyboardStore,
    ),
  };
});

// ─── Imports (after mocks are registered) ───────────────────────────────────
import { wsService } from '../../../../services/WebSocketService';
import { useKeyboard } from '../useKeyboard';

// Grab the actual store reference for setState/getState in test setup
const actualStore = jest.requireActual<typeof import('../../../../stores/keyboardStore')>(
  '../../../../stores/keyboardStore',
).useKeyboardStore;

const mockSend = wsService.send as jest.Mock;

beforeEach(() => {
  mockSend.mockClear();
  // Reset store to a clean empty-modifiers state before each test
  actualStore.setState({ lockedModifiers: new Set() });
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useKeyboard', () => {
  describe('sendType', () => {
    it('sends a keyboard type message with the provided text', () => {
      const { sendType } = useKeyboard();

      sendType('hello');

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({
        module: 'keyboard',
        action: 'type',
        payload: { text: 'hello' },
      });
    });

    it('sends a keyboard type message with an empty string', () => {
      const { sendType } = useKeyboard();

      sendType('');

      expect(mockSend).toHaveBeenCalledWith({
        module: 'keyboard',
        action: 'type',
        payload: { text: '' },
      });
    });
  });

  describe('sendKey', () => {
    it('sends a key message when no modifiers are locked', () => {
      const { sendKey } = useKeyboard();

      sendKey('enter');

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({
        module: 'keyboard',
        action: 'key',
        payload: { key: 'enter' },
      });
    });

    it('sends a combo message including the locked modifier', () => {
      actualStore.getState().toggleModifier('ctrl');

      const { sendKey } = useKeyboard();
      sendKey('c');

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({
        module: 'keyboard',
        action: 'combo',
        payload: { keys: ['ctrl', 'c'] },
      });
    });

    it('includes all locked modifiers in the combo', () => {
      actualStore.getState().toggleModifier('ctrl');
      actualStore.getState().toggleModifier('shift');

      const { sendKey } = useKeyboard();
      sendKey('z');

      expect(mockSend).toHaveBeenCalledTimes(1);
      const { module, action, payload } = mockSend.mock.calls[0][0];
      expect(module).toBe('keyboard');
      expect(action).toBe('combo');
      expect(payload.keys).toContain('ctrl');
      expect(payload.keys).toContain('shift');
      expect(payload.keys).toContain('z');
      expect(payload.keys).toHaveLength(3);
    });
  });

  describe('sendCombo', () => {
    it('sends a combo message with the provided keys', () => {
      const { sendCombo } = useKeyboard();

      sendCombo(['ctrl', 'v']);

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({
        module: 'keyboard',
        action: 'combo',
        payload: { keys: ['ctrl', 'v'] },
      });
    });

    it('sends a combo message with a single-element key array', () => {
      const { sendCombo } = useKeyboard();

      sendCombo(['escape']);

      expect(mockSend).toHaveBeenCalledWith({
        module: 'keyboard',
        action: 'combo',
        payload: { keys: ['escape'] },
      });
    });
  });

  describe('toggleModifier', () => {
    it('adds a modifier key to the locked set when toggled on', () => {
      const { toggleModifier } = useKeyboard();

      toggleModifier('ctrl');

      expect(actualStore.getState().lockedModifiers.has('ctrl')).toBe(true);
    });

    it('removes a modifier key from the locked set when toggled off', () => {
      actualStore.getState().toggleModifier('ctrl');

      const { toggleModifier } = useKeyboard();
      toggleModifier('ctrl');

      expect(actualStore.getState().lockedModifiers.has('ctrl')).toBe(false);
    });

    it('toggles different modifiers independently', () => {
      const { toggleModifier } = useKeyboard();

      toggleModifier('ctrl');
      toggleModifier('alt');

      const { lockedModifiers } = actualStore.getState();
      expect(lockedModifiers.has('ctrl')).toBe(true);
      expect(lockedModifiers.has('alt')).toBe(true);
      expect(lockedModifiers.has('shift')).toBe(false);
    });
  });

  describe('clearModifiers', () => {
    it('removes all locked modifiers from the set', () => {
      actualStore.getState().toggleModifier('ctrl');
      actualStore.getState().toggleModifier('alt');

      const { clearModifiers } = useKeyboard();
      clearModifiers();

      expect(actualStore.getState().lockedModifiers.size).toBe(0);
    });
  });

  describe('return value', () => {
    it('exposes the expected API surface', () => {
      const result = useKeyboard();

      expect(typeof result.sendType).toBe('function');
      expect(typeof result.sendKey).toBe('function');
      expect(typeof result.sendCombo).toBe('function');
      expect(typeof result.toggleModifier).toBe('function');
      expect(typeof result.clearModifiers).toBe('function');
      expect(result.lockedModifiers).toBeInstanceOf(Set);
    });

    it('reflects current lockedModifiers from the store', () => {
      actualStore.getState().toggleModifier('win');

      const { lockedModifiers } = useKeyboard();

      expect(lockedModifiers.has('win')).toBe(true);
    });
  });
});
