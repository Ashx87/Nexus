import { WebSocket } from 'ws';
import { KeyboardTypeMessage, KeyboardKeyMessage, KeyboardComboMessage } from '@nexus/shared';

// Numeric values match the real nut-js Key enum; they just need to be distinct
// so tests can assert that KEY_MAP resolved the right entry.
const Key = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 10,
  K: 11, L: 12, M: 13, N: 14, O: 15, P: 16, Q: 17, R: 18, S: 19, T: 20,
  U: 21, V: 22, W: 23, X: 24, Y: 25, Z: 26,
  Num0: 30, Num1: 31, Num2: 32, Num3: 33, Num4: 34,
  Num5: 35, Num6: 36, Num7: 37, Num8: 38, Num9: 39,
  LeftControl: 40, LeftAlt: 41, LeftShift: 42, LeftWin: 43,
  F1: 51, F2: 52, F3: 53, F4: 54, F5: 55, F6: 56,
  F7: 57, F8: 58, F9: 59, F10: 60, F11: 61, F12: 62,
  Up: 70, Down: 71, Left: 72, Right: 73,
  Home: 74, End: 75, PageUp: 76, PageDown: 77,
  Insert: 78, Delete: 79,
  Return: 80, Backspace: 81, Tab: 82, Escape: 83, Space: 84,
  Grave: 85, Minus: 86, Equal: 87, Backslash: 88,
  Semicolon: 89, Quote: 90, Comma: 91, Period: 92, Slash: 93,
  LeftBracket: 94, RightBracket: 95,
};

const mockType = jest.fn().mockResolvedValue(undefined);
const mockPressKey = jest.fn().mockResolvedValue(undefined);
const mockReleaseKey = jest.fn().mockResolvedValue(undefined);

jest.mock('@nut-tree-fork/nut-js', () => ({
  keyboard: {
    type: mockType,
    pressKey: mockPressKey,
    releaseKey: mockReleaseKey,
    config: {},
  },
  Key,
}));

import { handleKeyboardType, handleKeyboardKey, handleKeyboardCombo } from '../modules/keyboard';

function createMockWs(): WebSocket {
  return { send: jest.fn(), readyState: 1 } as unknown as WebSocket;
}

function parseSent(ws: WebSocket, callIndex = 0): ReturnType<typeof JSON.parse> {
  return JSON.parse((ws.send as jest.Mock).mock.calls[callIndex][0]);
}

describe('keyboard module', () => {
  let ws: WebSocket;

  beforeEach(() => {
    ws = createMockWs();
    jest.clearAllMocks();
  });

  // ── handleKeyboardType ──────────────────────────────────────────────────────

  describe('handleKeyboardType', () => {
    test('calls keyboard.type() with the provided text', async () => {
      const msg: KeyboardTypeMessage = {
        module: 'keyboard',
        action: 'type',
        payload: { text: 'hello world' },
      };
      await handleKeyboardType(ws, msg);
      expect(mockType).toHaveBeenCalledWith('hello world');
      expect(ws.send).not.toHaveBeenCalled();
    });

    test('sends INJECTION_FAILED error when keyboard.type() throws', async () => {
      mockType.mockRejectedValueOnce(new Error('injection blocked'));
      const msg: KeyboardTypeMessage = {
        module: 'keyboard',
        action: 'type',
        payload: { text: 'test' },
      };
      await handleKeyboardType(ws, msg);
      expect(ws.send).toHaveBeenCalledTimes(1);
      const sent = parseSent(ws);
      expect(sent.module).toBe('connection');
      expect(sent.action).toBe('error');
      expect(sent.payload.code).toBe('INJECTION_FAILED');
    });
  });

  // ── handleKeyboardKey ───────────────────────────────────────────────────────

  describe('handleKeyboardKey', () => {
    test('calls pressKey and releaseKey with the correct Key enum for "enter"', async () => {
      const msg: KeyboardKeyMessage = {
        module: 'keyboard',
        action: 'key',
        payload: { key: 'enter' },
      };
      await handleKeyboardKey(ws, msg);
      expect(mockPressKey).toHaveBeenCalledWith(Key.Return);
      expect(mockReleaseKey).toHaveBeenCalledWith(Key.Return);
      expect(ws.send).not.toHaveBeenCalled();
    });

    test('calls pressKey and releaseKey with the correct Key enum for lowercase letter "a"', async () => {
      const msg: KeyboardKeyMessage = {
        module: 'keyboard',
        action: 'key',
        payload: { key: 'a' },
      };
      await handleKeyboardKey(ws, msg);
      expect(mockPressKey).toHaveBeenCalledWith(Key.A);
      expect(mockReleaseKey).toHaveBeenCalledWith(Key.A);
    });

    test('normalizes uppercase input — "A" resolves the same as "a"', async () => {
      const msg: KeyboardKeyMessage = {
        module: 'keyboard',
        action: 'key',
        payload: { key: 'A' },
      };
      await handleKeyboardKey(ws, msg);
      expect(mockPressKey).toHaveBeenCalledWith(Key.A);
      expect(mockReleaseKey).toHaveBeenCalledWith(Key.A);
      expect(ws.send).not.toHaveBeenCalled();
    });

    test('sends PAYLOAD_INVALID error for an unknown key', async () => {
      const msg: KeyboardKeyMessage = {
        module: 'keyboard',
        action: 'key',
        payload: { key: 'unknownkey' },
      };
      await handleKeyboardKey(ws, msg);
      expect(mockPressKey).not.toHaveBeenCalled();
      expect(mockReleaseKey).not.toHaveBeenCalled();
      expect(ws.send).toHaveBeenCalledTimes(1);
      const sent = parseSent(ws);
      expect(sent.module).toBe('connection');
      expect(sent.action).toBe('error');
      expect(sent.payload.code).toBe('PAYLOAD_INVALID');
    });

    test('sends INJECTION_FAILED error when pressKey throws', async () => {
      mockPressKey.mockRejectedValueOnce(new Error('key injection failed'));
      const msg: KeyboardKeyMessage = {
        module: 'keyboard',
        action: 'key',
        payload: { key: 'enter' },
      };
      await handleKeyboardKey(ws, msg);
      expect(ws.send).toHaveBeenCalledTimes(1);
      const sent = parseSent(ws);
      expect(sent.payload.code).toBe('INJECTION_FAILED');
    });
  });

  // ── handleKeyboardCombo ─────────────────────────────────────────────────────

  describe('handleKeyboardCombo', () => {
    test('calls pressKey with all keys spread, then releaseKey with keys in reverse order', async () => {
      const msg: KeyboardComboMessage = {
        module: 'keyboard',
        action: 'combo',
        payload: { keys: ['ctrl', 'shift', 'escape'] },
      };
      await handleKeyboardCombo(ws, msg);

      // pressKey is called with all resolved keys spread as individual args
      expect(mockPressKey).toHaveBeenCalledWith(Key.LeftControl, Key.LeftShift, Key.Escape);

      // releaseKey is called with the same keys in reverse order
      expect(mockReleaseKey).toHaveBeenCalledWith(Key.Escape, Key.LeftShift, Key.LeftControl);

      expect(ws.send).not.toHaveBeenCalled();
    });

    test('does nothing (no pressKey or releaseKey calls) for an empty keys array', async () => {
      const msg: KeyboardComboMessage = {
        module: 'keyboard',
        action: 'combo',
        payload: { keys: [] },
      };
      await handleKeyboardCombo(ws, msg);
      expect(mockPressKey).not.toHaveBeenCalled();
      expect(mockReleaseKey).not.toHaveBeenCalled();
      expect(ws.send).not.toHaveBeenCalled();
    });

    test('sends PAYLOAD_INVALID error if any key in the array is unknown', async () => {
      const msg: KeyboardComboMessage = {
        module: 'keyboard',
        action: 'combo',
        payload: { keys: ['ctrl', 'badkey'] },
      };
      await handleKeyboardCombo(ws, msg);
      expect(mockPressKey).not.toHaveBeenCalled();
      expect(mockReleaseKey).not.toHaveBeenCalled();
      expect(ws.send).toHaveBeenCalledTimes(1);
      const sent = parseSent(ws);
      expect(sent.module).toBe('connection');
      expect(sent.action).toBe('error');
      expect(sent.payload.code).toBe('PAYLOAD_INVALID');
    });

    test('sends INJECTION_FAILED error when pressKey throws during combo', async () => {
      mockPressKey.mockRejectedValueOnce(new Error('combo injection failed'));
      const msg: KeyboardComboMessage = {
        module: 'keyboard',
        action: 'combo',
        payload: { keys: ['ctrl', 'c'] },
      };
      await handleKeyboardCombo(ws, msg);
      expect(ws.send).toHaveBeenCalledTimes(1);
      const sent = parseSent(ws);
      expect(sent.payload.code).toBe('INJECTION_FAILED');
    });
  });
});
