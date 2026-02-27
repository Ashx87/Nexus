import { WebSocket } from 'ws';
import { ErrorMessage } from '@nexus/shared';

export function sendInjectionError(ws: WebSocket, detail: string): void {
  const err: ErrorMessage = {
    module: 'connection',
    action: 'error',
    payload: { code: 'INJECTION_FAILED', message: detail },
  };
  ws.send(JSON.stringify(err));
}

export function sendPayloadError(ws: WebSocket, detail: string): void {
  const err: ErrorMessage = {
    module: 'connection',
    action: 'error',
    payload: { code: 'PAYLOAD_INVALID', message: detail },
  };
  ws.send(JSON.stringify(err));
}
