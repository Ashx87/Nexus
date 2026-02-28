import { WebSocket } from 'ws';
import { keyboard, Key } from '@nut-tree-fork/nut-js';
import { MacroExecuteMessage, MacroStep, MacroResultMessage, MAX_WAIT_MS } from '@nexus/shared';
import { sendPayloadError } from '../utils/errors';

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
  ctrl: Key.LeftControl, alt: Key.LeftAlt, shift: Key.LeftShift, win: Key.LeftWin,
  // Function keys
  f1: Key.F1, f2: Key.F2, f3: Key.F3, f4: Key.F4,
  f5: Key.F5, f6: Key.F6, f7: Key.F7, f8: Key.F8,
  f9: Key.F9, f10: Key.F10, f11: Key.F11, f12: Key.F12,
  // Navigation
  up: Key.Up, down: Key.Down, left: Key.Left, right: Key.Right,
  home: Key.Home, end: Key.End, pageup: Key.PageUp, pagedown: Key.PageDown,
  insert: Key.Insert, delete: Key.Delete,
  // Special keys
  enter: Key.Return, return: Key.Return, backspace: Key.Backspace,
  tab: Key.Tab, escape: Key.Escape, space: Key.Space,
  printscreen: Key.Print,
  grave: Key.Grave, minus: Key.Minus, equal: Key.Equal,
  backslash: Key.Backslash, semicolon: Key.Semicolon, quote: Key.Quote,
  comma: Key.Comma, period: Key.Period, slash: Key.Slash,
  leftbracket: Key.LeftBracket, rightbracket: Key.RightBracket,
};

const VALID_STEP_TYPES = new Set(['key_combo', 'key', 'type_text', 'wait']);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sendResult(ws: WebSocket, macroId: string, success: boolean, error?: string): void {
  const msg: MacroResultMessage = {
    module: 'macro',
    action: 'result',
    payload: { macroId, success, ...(error !== undefined ? { error } : {}) },
  };
  ws.send(JSON.stringify(msg));
}

function validateSteps(steps: readonly MacroStep[]): string | null {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!VALID_STEP_TYPES.has(step.type)) {
      return `Invalid step type "${step.type}" at index ${i}`;
    }
    if (step.type === 'key_combo') {
      for (const k of step.keys) {
        if (!(k.toLowerCase() in KEY_MAP)) {
          return `Unknown key "${k}" in key_combo at step ${i}`;
        }
      }
    }
    if (step.type === 'key') {
      if (!(step.key.toLowerCase() in KEY_MAP)) {
        return `Unknown key "${step.key}" at step ${i}`;
      }
    }
  }
  return null;
}

async function executeStep(step: MacroStep): Promise<void> {
  if (step.type !== 'wait' && step.delay > 0) {
    await sleep(Math.min(step.delay, MAX_WAIT_MS));
  }

  switch (step.type) {
    case 'key_combo': {
      const nutKeys = step.keys.map((k) => KEY_MAP[k.toLowerCase()]);
      await keyboard.pressKey(...nutKeys);
      await keyboard.releaseKey(...[...nutKeys].reverse());
      break;
    }
    case 'key': {
      const nutKey = KEY_MAP[step.key.toLowerCase()];
      await keyboard.pressKey(nutKey);
      await keyboard.releaseKey(nutKey);
      break;
    }
    case 'type_text': {
      await keyboard.type(step.text);
      break;
    }
    case 'wait': {
      await sleep(Math.min(step.ms, MAX_WAIT_MS));
      break;
    }
  }
}

export async function handleMacroExecute(ws: WebSocket, msg: MacroExecuteMessage): Promise<void> {
  const { macroId, steps } = msg.payload;

  if (!Array.isArray(steps) || steps.length === 0) {
    sendPayloadError(ws, 'Macro must have at least one step');
    return;
  }

  const validationError = validateSteps(steps);
  if (validationError !== null) {
    sendPayloadError(ws, validationError);
    return;
  }

  for (let i = 0; i < steps.length; i++) {
    try {
      await executeStep(steps[i]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'unknown error';
      console.error(`[macro] "${macroId}" failed at step ${i}:`, detail);
      sendResult(ws, macroId, false, `Failed at step ${i}: ${detail}`);
      return;
    }
  }

  sendResult(ws, macroId, true);
}
