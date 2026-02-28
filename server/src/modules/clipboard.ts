import { WebSocket } from 'ws';
import clipboard from 'clipboardy';
import {
  ClipboardSyncMessage,
  ClipboardRequestMessage,
  CLIPBOARD_MAX_TEXT_BYTES,
} from '@nexus/shared';
import { sendInjectionError, sendPayloadError } from '../utils/errors';

export async function handleClipboardSync(ws: WebSocket, msg: ClipboardSyncMessage): Promise<void> {
  const { content, direction } = msg.payload;

  if (direction !== 'phone_to_pc') {
    return;
  }

  if (Buffer.byteLength(content, 'utf-8') > CLIPBOARD_MAX_TEXT_BYTES) {
    sendPayloadError(ws, 'Text content exceeds 1MB limit');
    return;
  }

  try {
    await clipboard.write(content);
    console.log(`[clipboard] wrote ${content.length} chars to PC clipboard`);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'clipboard write failed';
    console.error('[clipboard] write failed:', detail);
    sendInjectionError(ws, detail);
  }
}

export async function handleClipboardRequest(ws: WebSocket, _msg: ClipboardRequestMessage): Promise<void> {
  try {
    const text = await clipboard.read();
    const response: ClipboardSyncMessage = {
      module: 'clipboard',
      action: 'sync',
      payload: { content: text, direction: 'pc_to_phone' },
    };
    ws.send(JSON.stringify(response));
    console.log(`[clipboard] sent ${text.length} chars to client`);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'clipboard read failed';
    console.error('[clipboard] read failed:', detail);
    sendInjectionError(ws, detail);
  }
}
