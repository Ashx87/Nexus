import { WebSocket } from 'ws';
import clipboard from 'clipboardy';
import {
  ClipboardSyncMessage,
  ClipboardRequestMessage,
  ClipboardImageMetaMessage,
  ClipboardImageCompleteMessage,
  CLIPBOARD_MAX_TEXT_BYTES,
  CLIPBOARD_MAX_IMAGE_BYTES,
} from '@nexus/shared';
import { sendInjectionError, sendPayloadError } from '../utils/errors';
import { ImageTransferManager } from './image-transfer';
import { writeClipboardImage } from './clipboard-image';

const transferManager = new ImageTransferManager();

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

export async function handleClipboardImageMeta(ws: WebSocket, msg: ClipboardImageMetaMessage): Promise<void> {
  const { transferId, direction, size } = msg.payload;

  if (size > CLIPBOARD_MAX_IMAGE_BYTES) {
    sendPayloadError(ws, `Image exceeds ${CLIPBOARD_MAX_IMAGE_BYTES} byte limit`);
    return;
  }

  if (direction === 'phone_to_pc') {
    transferManager.startTransfer(transferId, msg.payload.totalChunks, size);
    console.log(`[clipboard] started inbound image transfer ${transferId} (${size} bytes, ${msg.payload.totalChunks} chunks)`);
  }
}

export function handleBinaryChunk(ws: WebSocket, data: Buffer): void {
  // Binary frame format: [transferId (36 bytes UTF-8)] [chunkIndex (4 bytes BE)] [data...]
  if (data.length < 40) {
    console.warn('[clipboard] binary frame too small to contain header');
    return;
  }

  const transferId = data.subarray(0, 36).toString('utf-8');
  const chunkIndex = data.readUInt32BE(36);
  const chunkData = data.subarray(40);

  const assembled = transferManager.addChunk(transferId, chunkIndex, chunkData);
  if (assembled !== null) {
    void writeClipboardImage(assembled)
      .then(() => {
        const complete: ClipboardImageCompleteMessage = {
          module: 'clipboard',
          action: 'image_complete',
          payload: { transferId, success: true },
        };
        ws.send(JSON.stringify(complete));
        console.log(`[clipboard] image ${transferId} written to PC clipboard (${assembled.length} bytes)`);
      })
      .catch((error) => {
        const detail = error instanceof Error ? error.message : 'write failed';
        const complete: ClipboardImageCompleteMessage = {
          module: 'clipboard',
          action: 'image_complete',
          payload: { transferId, success: false, error: detail },
        };
        ws.send(JSON.stringify(complete));
      });
  }
}

export async function handleClipboardImageComplete(_ws: WebSocket, _msg: ClipboardImageCompleteMessage): Promise<void> {
  console.log('[clipboard] client acknowledged image receipt');
}
