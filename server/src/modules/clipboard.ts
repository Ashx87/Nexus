import { WebSocket } from 'ws';
import { ClipboardSyncMessage } from '@nexus/shared';

export function handleClipboardSync(_ws: WebSocket, msg: ClipboardSyncMessage): void {
  console.log(
    `[clipboard] sync direction=${msg.payload.direction} content="${msg.payload.content.substring(0, 50)}..."`,
  );
}
