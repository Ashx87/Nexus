import { WebSocket } from 'ws';
import { MediaControlMessage } from '@nexus/shared';

export function handleMediaControl(_ws: WebSocket, msg: MediaControlMessage): void {
  console.log(`[media] control cmd=${msg.payload.cmd}`);
}
