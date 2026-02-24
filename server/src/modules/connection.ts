import { WebSocket } from 'ws';
import { PingMessage, PongMessage } from '@nexus/shared';

export function handlePing(ws: WebSocket, _msg: PingMessage): void {
  const pong: PongMessage = { module: 'connection', action: 'pong', payload: {} };
  ws.send(JSON.stringify(pong));
}
