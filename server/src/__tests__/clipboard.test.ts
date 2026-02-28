import { WebSocket } from 'ws';
import { ClipboardSyncMessage, ClipboardRequestMessage } from '@nexus/shared';

const mockWrite = jest.fn().mockResolvedValue(undefined);
const mockRead = jest.fn().mockResolvedValue('pc clipboard text');

jest.mock('clipboardy', () => ({
  __esModule: true,
  default: {
    write: (...args: unknown[]) => mockWrite(...args),
    read: (...args: unknown[]) => mockRead(...args),
  },
}));

import { handleClipboardSync, handleClipboardRequest } from '../modules/clipboard';

function createMockWs(): WebSocket {
  return { send: jest.fn(), readyState: 1 } as unknown as WebSocket;
}

function parseSent(ws: WebSocket, callIndex = 0): ReturnType<typeof JSON.parse> {
  return JSON.parse((ws.send as jest.Mock).mock.calls[callIndex][0] as string);
}

describe('clipboard module', () => {
  let ws: WebSocket;

  beforeEach(() => {
    ws = createMockWs();
    jest.clearAllMocks();
  });

  describe('handleClipboardSync (phone_to_pc)', () => {
    test('writes text content to PC clipboard via clipboardy', async () => {
      const msg: ClipboardSyncMessage = {
        module: 'clipboard',
        action: 'sync',
        payload: { content: 'hello from phone', direction: 'phone_to_pc' },
      };
      await handleClipboardSync(ws, msg);
      expect(mockWrite).toHaveBeenCalledWith('hello from phone');
    });

    test('sends error when clipboardy.write fails', async () => {
      mockWrite.mockRejectedValueOnce(new Error('write failed'));
      const msg: ClipboardSyncMessage = {
        module: 'clipboard',
        action: 'sync',
        payload: { content: 'test', direction: 'phone_to_pc' },
      };
      await handleClipboardSync(ws, msg);
      expect(ws.send).toHaveBeenCalledTimes(1);
      const sent = parseSent(ws);
      expect(sent.payload.code).toBe('INJECTION_FAILED');
    });

    test('rejects text exceeding 1MB', async () => {
      const msg: ClipboardSyncMessage = {
        module: 'clipboard',
        action: 'sync',
        payload: { content: 'x'.repeat(1_048_577), direction: 'phone_to_pc' },
      };
      await handleClipboardSync(ws, msg);
      expect(mockWrite).not.toHaveBeenCalled();
      expect(ws.send).toHaveBeenCalledTimes(1);
      const sent = parseSent(ws);
      expect(sent.payload.code).toBe('PAYLOAD_INVALID');
    });

    test('ignores pc_to_phone direction', async () => {
      const msg: ClipboardSyncMessage = {
        module: 'clipboard',
        action: 'sync',
        payload: { content: 'test', direction: 'pc_to_phone' },
      };
      await handleClipboardSync(ws, msg);
      expect(mockWrite).not.toHaveBeenCalled();
      expect(ws.send).not.toHaveBeenCalled();
    });
  });

  describe('handleClipboardRequest (pc_to_phone)', () => {
    test('reads PC clipboard and sends text back to client', async () => {
      const msg: ClipboardRequestMessage = {
        module: 'clipboard',
        action: 'request',
        payload: { direction: 'pc_to_phone' },
      };
      await handleClipboardRequest(ws, msg);
      expect(mockRead).toHaveBeenCalled();
      expect(ws.send).toHaveBeenCalledTimes(1);
      const sent = parseSent(ws);
      expect(sent.module).toBe('clipboard');
      expect(sent.action).toBe('sync');
      expect(sent.payload.content).toBe('pc clipboard text');
      expect(sent.payload.direction).toBe('pc_to_phone');
    });

    test('sends error when clipboardy.read fails', async () => {
      mockRead.mockRejectedValueOnce(new Error('read failed'));
      const msg: ClipboardRequestMessage = {
        module: 'clipboard',
        action: 'request',
        payload: { direction: 'pc_to_phone' },
      };
      await handleClipboardRequest(ws, msg);
      expect(ws.send).toHaveBeenCalledTimes(1);
      const sent = parseSent(ws);
      expect(sent.payload.code).toBe('INJECTION_FAILED');
    });
  });
});
