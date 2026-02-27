import { WebSocket } from 'ws';
import { MediaControlMessage } from '@nexus/shared';

// Numeric values match the real nut-js Key enum; they just need to be distinct
// so tests can assert that KEY_MAP resolved the right entry.
const Key = {
  AudioPlay: 201, AudioNext: 202, AudioPrev: 203,
  AudioVolUp: 204, AudioVolDown: 205, AudioMute: 206,
};

const mockPressKey = jest.fn().mockResolvedValue(undefined);
const mockReleaseKey = jest.fn().mockResolvedValue(undefined);

jest.mock('@nut-tree-fork/nut-js', () => ({
  keyboard: { pressKey: mockPressKey, releaseKey: mockReleaseKey, config: {} },
  Key,
}));

import { handleMediaControl } from '../modules/media';

function createMockWs(): WebSocket {
  return { send: jest.fn(), readyState: 1 } as unknown as WebSocket;
}

function parseSent(ws: WebSocket, callIndex = 0): ReturnType<typeof JSON.parse> {
  return JSON.parse((ws.send as jest.Mock).mock.calls[callIndex][0]);
}

describe('handleMediaControl', () => {
  let ws: WebSocket;
  beforeEach(() => { ws = createMockWs(); jest.clearAllMocks(); });

  const cases: Array<[MediaControlMessage['payload']['cmd'], number]> = [
    ['play_pause', Key.AudioPlay],
    ['next',       Key.AudioNext],
    ['prev',       Key.AudioPrev],
    ['volume_up',  Key.AudioVolUp],
    ['volume_down',Key.AudioVolDown],
    ['mute',       Key.AudioMute],
  ];

  test.each(cases)('cmd "%s" presses and releases the correct Key', async (cmd, expectedKey) => {
    const msg: MediaControlMessage = { module: 'media', action: 'control', payload: { cmd } };
    await handleMediaControl(ws, msg);
    expect(mockPressKey).toHaveBeenCalledWith(expectedKey);
    expect(mockReleaseKey).toHaveBeenCalledWith(expectedKey);
    expect(ws.send).not.toHaveBeenCalled();
  });

  test('sends PAYLOAD_INVALID error for an unknown cmd', async () => {
    const msg = { module: 'media', action: 'control', payload: { cmd: 'eject' } } as unknown as MediaControlMessage;
    await handleMediaControl(ws, msg);
    expect(mockPressKey).not.toHaveBeenCalled();
    expect(ws.send).toHaveBeenCalledTimes(1);
    const sent = parseSent(ws);
    expect(sent.payload.code).toBe('PAYLOAD_INVALID');
  });

  test('sends INJECTION_FAILED error when pressKey throws', async () => {
    mockPressKey.mockRejectedValueOnce(new Error('blocked'));
    const msg: MediaControlMessage = { module: 'media', action: 'control', payload: { cmd: 'play_pause' } };
    await handleMediaControl(ws, msg);
    expect(ws.send).toHaveBeenCalledTimes(1);
    const sent = parseSent(ws);
    expect(sent.module).toBe('connection');
    expect(sent.action).toBe('error');
    expect(sent.payload.code).toBe('INJECTION_FAILED');
  });
});
