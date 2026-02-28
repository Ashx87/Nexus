import { WebSocket } from 'ws';
import { MacroExecuteMessage, MAX_WAIT_MS } from '@nexus/shared';

// Numeric values match the real nut-js Key enum; they just need to be distinct
// so tests can assert that KEY_MAP resolved the right entry.
const Key = {
  LeftControl: 40, LeftAlt: 41, LeftShift: 42, LeftWin: 43,
  A: 1, C: 3, V: 22, Z: 26, Return: 80, Print: 99,
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

import { handleMacroExecute } from '../modules/macro';

function createMockWs(): WebSocket {
  return { send: jest.fn(), readyState: 1 } as unknown as WebSocket;
}

function parseSent(ws: WebSocket, callIndex = 0): ReturnType<typeof JSON.parse> {
  return JSON.parse((ws.send as jest.Mock).mock.calls[callIndex][0]);
}

describe('handleMacroExecute', () => {
  let ws: WebSocket;

  beforeEach(() => {
    ws = createMockWs();
    jest.clearAllMocks();
  });

  // ── Validation tests ────────────────────────────────────────────────────────

  test('sends PAYLOAD_INVALID when steps is missing', async () => {
    const msg = {
      module: 'macro',
      action: 'execute',
      payload: { macroId: 'test-macro' },
    } as unknown as MacroExecuteMessage;

    await handleMacroExecute(ws, msg);

    expect(ws.send).toHaveBeenCalledTimes(1);
    const sent = parseSent(ws);
    expect(sent.payload.code).toBe('PAYLOAD_INVALID');
  });

  test('sends PAYLOAD_INVALID when steps is empty array', async () => {
    const msg: MacroExecuteMessage = {
      module: 'macro',
      action: 'execute',
      payload: { macroId: 'test-macro', steps: [] },
    };

    await handleMacroExecute(ws, msg);

    expect(ws.send).toHaveBeenCalledTimes(1);
    const sent = parseSent(ws);
    expect(sent.payload.code).toBe('PAYLOAD_INVALID');
  });

  test('sends PAYLOAD_INVALID when step has unknown type', async () => {
    const msg = {
      module: 'macro',
      action: 'execute',
      payload: {
        macroId: 'test-macro',
        steps: [{ type: 'launch_missile', target: 'moon' }],
      },
    } as unknown as MacroExecuteMessage;

    await handleMacroExecute(ws, msg);

    expect(ws.send).toHaveBeenCalledTimes(1);
    const sent = parseSent(ws);
    expect(sent.payload.code).toBe('PAYLOAD_INVALID');
  });

  // ── Single-step execution tests ─────────────────────────────────────────────

  test('executes single key_combo step', async () => {
    const msg: MacroExecuteMessage = {
      module: 'macro',
      action: 'execute',
      payload: {
        macroId: 'copy-combo',
        steps: [{ type: 'key_combo', keys: ['ctrl', 'c'], delay: 0 }],
      },
    };

    await handleMacroExecute(ws, msg);

    // pressKey called with resolved keys
    expect(mockPressKey).toHaveBeenCalledWith(Key.LeftControl, Key.C);
    // releaseKey called in reverse order
    expect(mockReleaseKey).toHaveBeenCalledWith(Key.C, Key.LeftControl);

    expect(ws.send).toHaveBeenCalledTimes(1);
    const sent = parseSent(ws);
    expect(sent.module).toBe('macro');
    expect(sent.action).toBe('result');
    expect(sent.payload.success).toBe(true);
  });

  test('executes single key step', async () => {
    const msg: MacroExecuteMessage = {
      module: 'macro',
      action: 'execute',
      payload: {
        macroId: 'press-enter',
        steps: [{ type: 'key', key: 'enter', delay: 0 }],
      },
    };

    await handleMacroExecute(ws, msg);

    expect(mockPressKey).toHaveBeenCalledWith(Key.Return);
    expect(mockReleaseKey).toHaveBeenCalledWith(Key.Return);

    expect(ws.send).toHaveBeenCalledTimes(1);
    const sent = parseSent(ws);
    expect(sent.module).toBe('macro');
    expect(sent.action).toBe('result');
    expect(sent.payload.success).toBe(true);
  });

  test('executes single type_text step', async () => {
    const msg: MacroExecuteMessage = {
      module: 'macro',
      action: 'execute',
      payload: {
        macroId: 'type-hello',
        steps: [{ type: 'type_text', text: 'hello world', delay: 0 }],
      },
    };

    await handleMacroExecute(ws, msg);

    expect(mockType).toHaveBeenCalledWith('hello world');

    expect(ws.send).toHaveBeenCalledTimes(1);
    const sent = parseSent(ws);
    expect(sent.module).toBe('macro');
    expect(sent.action).toBe('result');
    expect(sent.payload.success).toBe(true);
  });

  // ── Multi-step execution test ───────────────────────────────────────────────

  test('executes multi-step macro sequentially', async () => {
    const callOrder: string[] = [];

    mockPressKey.mockImplementation(async () => {
      callOrder.push('pressKey');
    });
    mockReleaseKey.mockImplementation(async () => {
      callOrder.push('releaseKey');
    });
    mockType.mockImplementation(async () => {
      callOrder.push('type');
    });

    const msg: MacroExecuteMessage = {
      module: 'macro',
      action: 'execute',
      payload: {
        macroId: 'open-terminal',
        steps: [
          { type: 'key_combo', keys: ['win', 'r'], delay: 0 },
          { type: 'type_text', text: 'cmd', delay: 0 },
          { type: 'key', key: 'enter', delay: 0 },
        ],
      },
    };

    await handleMacroExecute(ws, msg);

    // key_combo press+release happens first, then type, then key press+release
    expect(callOrder).toEqual([
      'pressKey', 'releaseKey',  // step 0: key_combo
      'type',                     // step 1: type_text
      'pressKey', 'releaseKey',  // step 2: key
    ]);

    expect(ws.send).toHaveBeenCalledTimes(1);
    const sent = parseSent(ws);
    expect(sent.module).toBe('macro');
    expect(sent.action).toBe('result');
    expect(sent.payload.success).toBe(true);
  });

  // ── Error handling test ─────────────────────────────────────────────────────

  test('stops and returns error with step index on failure', async () => {
    // First step succeeds, second step fails
    mockPressKey
      .mockResolvedValueOnce(undefined)   // step 0 press
      .mockRejectedValueOnce(new Error('injection blocked'));  // step 1 press

    mockReleaseKey.mockResolvedValue(undefined);

    const msg: MacroExecuteMessage = {
      module: 'macro',
      action: 'execute',
      payload: {
        macroId: 'fail-at-step-1',
        steps: [
          { type: 'key', key: 'a', delay: 0 },
          { type: 'key', key: 'enter', delay: 0 },
          { type: 'key', key: 'enter', delay: 0 },  // should never execute
        ],
      },
    };

    await handleMacroExecute(ws, msg);

    expect(ws.send).toHaveBeenCalledTimes(1);
    const sent = parseSent(ws);
    expect(sent.module).toBe('macro');
    expect(sent.action).toBe('result');
    expect(sent.payload.success).toBe(false);
    expect(sent.payload.error).toContain('step 1');

    // Third step should never have been attempted
    expect(mockPressKey).toHaveBeenCalledTimes(2);
  });

  // ── Unknown key in combo test ───────────────────────────────────────────────

  test('sends PAYLOAD_INVALID for unknown key in key_combo', async () => {
    const msg: MacroExecuteMessage = {
      module: 'macro',
      action: 'execute',
      payload: {
        macroId: 'bad-combo',
        steps: [{ type: 'key_combo', keys: ['ctrl', 'badkey'], delay: 0 }],
      },
    };

    await handleMacroExecute(ws, msg);

    expect(mockPressKey).not.toHaveBeenCalled();
    expect(ws.send).toHaveBeenCalledTimes(1);
    const sent = parseSent(ws);
    expect(sent.payload.code).toBe('PAYLOAD_INVALID');
  });

  // ── Wait step capping test ──────────────────────────────────────────────────

  test('caps wait step at MAX_WAIT_MS', async () => {
    jest.useFakeTimers();

    const msg: MacroExecuteMessage = {
      module: 'macro',
      action: 'execute',
      payload: {
        macroId: 'long-wait',
        steps: [
          { type: 'wait', ms: 999_999 },  // far exceeds MAX_WAIT_MS
          { type: 'key', key: 'a', delay: 0 },
        ],
      },
    };

    const executePromise = handleMacroExecute(ws, msg);

    // Advance by MAX_WAIT_MS (30000ms) — the wait should be capped to this
    jest.advanceTimersByTime(MAX_WAIT_MS);

    await executePromise;

    // The key step after the wait should have executed
    expect(mockPressKey).toHaveBeenCalledWith(Key.A);
    expect(mockReleaseKey).toHaveBeenCalledWith(Key.A);

    expect(ws.send).toHaveBeenCalledTimes(1);
    const sent = parseSent(ws);
    expect(sent.module).toBe('macro');
    expect(sent.action).toBe('result');
    expect(sent.payload.success).toBe(true);

    jest.useRealTimers();
  });
});
