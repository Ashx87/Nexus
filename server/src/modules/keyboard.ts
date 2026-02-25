import { WebSocket } from 'ws';
import { keyboard, Key } from '@nut-tree-fork/nut-js';
import {
  KeyboardTypeMessage,
  KeyboardKeyMessage,
  KeyboardComboMessage,
  ErrorMessage,
} from '@nexus/shared';

keyboard.config.autoDelayMs = 0;

const KEY_MAP: Record<string, Key> = {
  // Letters
  a: Key.A, b: Key.B, c: Key.C, d: Key.D, e: Key.E,
  f: Key.F, g: Key.G, h: Key.H, i: Key.I, j: Key.J,
  k: Key.K, l: Key.L, m: Key.M, n: Key.N, o: Key.O,
  p: Key.P, q: Key.Q, r: Key.R, s: Key.S, t: Key.T,
  u: Key.U, v: Key.V, w: Key.W, x: Key.X, y: Key.Y,
  z: Key.Z,

  // Digits
  '0': Key.Num0, '1': Key.Num1, '2': Key.Num2,
  '3': Key.Num3, '4': Key.Num4, '5': Key.Num5,
  '6': Key.Num6, '7': Key.Num7, '8': Key.Num8,
  '9': Key.Num9,

  // Modifiers
  ctrl: Key.LeftControl,
  alt: Key.LeftAlt,
  shift: Key.LeftShift,
  win: Key.LeftWin,

  // Function keys
  f1: Key.F1,   f2: Key.F2,   f3: Key.F3,   f4: Key.F4,
  f5: Key.F5,   f6: Key.F6,   f7: Key.F7,   f8: Key.F8,
  f9: Key.F9,   f10: Key.F10, f11: Key.F11, f12: Key.F12,

  // Navigation
  up: Key.Up,
  down: Key.Down,
  left: Key.Left,
  right: Key.Right,
  home: Key.Home,
  end: Key.End,
  pageup: Key.PageUp,
  pagedown: Key.PageDown,
  insert: Key.Insert,
  delete: Key.Delete,

  // Special keys
  enter: Key.Return,
  return: Key.Return,
  backspace: Key.Backspace,
  tab: Key.Tab,
  escape: Key.Escape,
  space: Key.Space,
  grave: Key.Grave,
  minus: Key.Minus,
  equal: Key.Equal,
  backslash: Key.Backslash,
  semicolon: Key.Semicolon,
  quote: Key.Quote,
  comma: Key.Comma,
  period: Key.Period,
  slash: Key.Slash,
  leftbracket: Key.LeftBracket,
  rightbracket: Key.RightBracket,
};

function sendInjectionError(ws: WebSocket, detail: string): void {
  const err: ErrorMessage = {
    module: 'connection',
    action: 'error',
    payload: { code: 'INJECTION_FAILED', message: detail },
  };
  ws.send(JSON.stringify(err));
}

function sendPayloadError(ws: WebSocket, detail: string): void {
  const err: ErrorMessage = {
    module: 'connection',
    action: 'error',
    payload: { code: 'PAYLOAD_INVALID', message: detail },
  };
  ws.send(JSON.stringify(err));
}

const MAX_TYPE_LENGTH = 1000;

export async function handleKeyboardType(ws: WebSocket, msg: KeyboardTypeMessage): Promise<void> {
  if (msg.payload.text.length > MAX_TYPE_LENGTH) {
    sendPayloadError(ws, `Text too long: max ${MAX_TYPE_LENGTH} characters`);
    return;
  }
  try {
    await keyboard.type(msg.payload.text);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'keyboard type failed';
    console.error('[keyboard] type failed:', detail);
    sendInjectionError(ws, detail);
  }
}

export async function handleKeyboardKey(ws: WebSocket, msg: KeyboardKeyMessage): Promise<void> {
  const keyStr = msg.payload.key.toLowerCase();
  const nutKey = KEY_MAP[keyStr];

  if (nutKey === undefined) {
    console.warn(`[keyboard] unknown key: "${keyStr}"`);
    sendPayloadError(ws, `Unknown key: "${keyStr}"`);
    return;
  }

  try {
    await keyboard.pressKey(nutKey);
    await keyboard.releaseKey(nutKey);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'keyboard key failed';
    console.error(`[keyboard] key "${keyStr}" failed:`, detail);
    sendInjectionError(ws, detail);
  }
}

export async function handleKeyboardCombo(ws: WebSocket, msg: KeyboardComboMessage): Promise<void> {
  if (msg.payload.keys.length === 0) return;

  const nutKeys: Key[] = [];

  for (const keyStr of msg.payload.keys) {
    const normalized = keyStr.toLowerCase();
    const nutKey = KEY_MAP[normalized];

    if (nutKey === undefined) {
      console.warn(`[keyboard] unknown key in combo: "${normalized}"`);
      sendPayloadError(ws, `Unknown key in combo: "${normalized}"`);
      return;
    }

    nutKeys.push(nutKey);
  }

  try {
    await keyboard.pressKey(...nutKeys);
    await keyboard.releaseKey(...[...nutKeys].reverse());
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'keyboard combo failed';
    console.error(`[keyboard] combo "${msg.payload.keys.join('+')}" failed:`, detail);
    sendInjectionError(ws, detail);
  }
}
