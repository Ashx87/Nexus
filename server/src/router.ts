import { WebSocket } from 'ws';
import { InboundMessage, ErrorMessage } from '@nexus/shared';
import { handlePing } from './modules/connection';
import { handleMouseMove, handleMouseClick, handleMouseScroll } from './modules/mouse';
import {
  handleKeyboardType,
  handleKeyboardKey,
  handleKeyboardCombo,
} from './modules/keyboard';
import { handleMediaControl } from './modules/media';
import { handleMacroExecute } from './modules/macro';
import { handleClipboardSync } from './modules/clipboard';

function sendError(ws: WebSocket, code: ErrorMessage['payload']['code'], message: string): void {
  const err: ErrorMessage = { module: 'connection', action: 'error', payload: { code, message } };
  ws.send(JSON.stringify(err));
}

export function route(ws: WebSocket, raw: string): void {
  let msg: InboundMessage;

  try {
    msg = JSON.parse(raw) as InboundMessage;
  } catch {
    console.error('[router] invalid JSON received');
    sendError(ws, 'INVALID_JSON', 'Failed to parse message as JSON');
    return;
  }

  if (!msg.module || !msg.action) {
    console.error('[router] missing module or action field');
    sendError(ws, 'PAYLOAD_INVALID', 'Message must have module and action fields');
    return;
  }

  console.log(`[router] ${msg.module}.${msg.action}`);

  switch (msg.module) {
    case 'connection':
      if (msg.action === 'ping') handlePing(ws, msg as any);
      break;

    case 'mouse':
      if (msg.action === 'move') handleMouseMove(ws, msg as any);
      else if (msg.action === 'click') handleMouseClick(ws, msg as any);
      else if (msg.action === 'scroll') handleMouseScroll(ws, msg as any);
      break;

    case 'keyboard':
      if (msg.action === 'type') handleKeyboardType(ws, msg as any);
      else if (msg.action === 'key') handleKeyboardKey(ws, msg as any);
      else if (msg.action === 'combo') handleKeyboardCombo(ws, msg as any);
      break;

    case 'media':
      if (msg.action === 'control') handleMediaControl(ws, msg as any);
      break;

    case 'macro':
      if (msg.action === 'execute') handleMacroExecute(ws, msg as any);
      break;

    case 'clipboard':
      if (msg.action === 'sync') handleClipboardSync(ws, msg as any);
      break;

    default:
      console.warn(`[router] unknown module: ${(msg as any).module}`);
      sendError(ws, 'UNKNOWN_MODULE', `Unknown module: ${(msg as any).module}`);
  }
}
