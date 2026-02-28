import { WebSocket } from 'ws';

const mockRead = jest.fn().mockResolvedValue('');

jest.mock('clipboardy', () => ({
  __esModule: true,
  default: {
    read: (...args: unknown[]) => mockRead(...args),
  },
}));

import { ClipboardWatcher } from '../modules/clipboard-watcher';

function createMockWs(): WebSocket {
  return { send: jest.fn(), readyState: 1 } as unknown as WebSocket;
}

function parseSent(ws: WebSocket, callIndex = 0): ReturnType<typeof JSON.parse> {
  return JSON.parse((ws.send as jest.Mock).mock.calls[callIndex][0] as string);
}

describe('ClipboardWatcher', () => {
  let ws: WebSocket;
  let watcher: ClipboardWatcher;

  beforeEach(() => {
    ws = createMockWs();
    jest.useFakeTimers();
    jest.clearAllMocks();
    watcher = new ClipboardWatcher();
  });

  afterEach(() => {
    watcher.stop();
    jest.useRealTimers();
  });

  test('does not push on first poll (sets baseline)', async () => {
    mockRead.mockResolvedValue('initial text');
    watcher.start(ws);

    await jest.advanceTimersByTimeAsync(1000);
    expect(ws.send).not.toHaveBeenCalled();
  });

  test('pushes text when clipboard changes after baseline', async () => {
    mockRead.mockResolvedValueOnce('initial');
    watcher.start(ws);

    // First poll — sets baseline
    await jest.advanceTimersByTimeAsync(1000);

    // Change clipboard content
    mockRead.mockResolvedValueOnce('new content');
    await jest.advanceTimersByTimeAsync(1000);

    expect(ws.send).toHaveBeenCalledTimes(1);
    const sent = parseSent(ws);
    expect(sent.module).toBe('clipboard');
    expect(sent.action).toBe('sync');
    expect(sent.payload.content).toBe('new content');
    expect(sent.payload.direction).toBe('pc_to_phone');
  });

  test('does not push when clipboard has not changed', async () => {
    mockRead.mockResolvedValue('same text');
    watcher.start(ws);

    await jest.advanceTimersByTimeAsync(1000); // baseline
    await jest.advanceTimersByTimeAsync(1000); // same content
    await jest.advanceTimersByTimeAsync(1000); // same content

    expect(ws.send).not.toHaveBeenCalled();
  });

  test('stop() clears the polling interval', async () => {
    mockRead.mockResolvedValue('text');
    watcher.start(ws);
    watcher.stop();

    await jest.advanceTimersByTimeAsync(5000);
    // mockRead should not have been called since we stopped before any poll
    expect(mockRead).not.toHaveBeenCalled();
  });
});
