import { WebSocket } from 'ws';
import { keyboard, Key } from '@nut-tree-fork/nut-js';
import { MediaControlMessage, MediaCmd, ErrorMessage } from '@nexus/shared';

const MEDIA_KEY_MAP: Record<MediaCmd, Key> = {
  play_pause:  Key.AudioPlay,
  next:        Key.AudioNext,
  prev:        Key.AudioPrev,
  volume_up:   Key.AudioVolUp,
  volume_down: Key.AudioVolDown,
  mute:        Key.AudioMute,
};

export async function handleMediaControl(ws: WebSocket, msg: MediaControlMessage): Promise<void> {
  const key = MEDIA_KEY_MAP[msg.payload.cmd];

  if (key === undefined) {
    const err: ErrorMessage = {
      module: 'connection',
      action: 'error',
      payload: { code: 'PAYLOAD_INVALID', message: `Unknown media cmd: "${msg.payload.cmd}"` },
    };
    ws.send(JSON.stringify(err));
    return;
  }

  try {
    await keyboard.pressKey(key);
    await keyboard.releaseKey(key);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'media control failed';
    console.error(`[media] cmd "${msg.payload.cmd}" failed:`, detail);
    const err: ErrorMessage = {
      module: 'connection',
      action: 'error',
      payload: { code: 'INJECTION_FAILED', message: detail },
    };
    ws.send(JSON.stringify(err));
  }
}
