import { WebSocket } from 'ws';
import { mouse, Button, Point } from '@nut-tree-fork/nut-js';
import {
  MouseMoveMessage,
  MouseClickMessage,
  MouseScrollMessage,
  MouseButton,
  ErrorMessage,
} from '@nexus/shared';

mouse.config.autoDelayMs = 0;

const BUTTON_MAP: Record<MouseButton, Button> = {
  left: Button.LEFT,
  right: Button.RIGHT,
  middle: Button.MIDDLE,
};

function sendInjectionError(ws: WebSocket, detail: string): void {
  const err: ErrorMessage = {
    module: 'connection',
    action: 'error',
    payload: { code: 'INJECTION_FAILED', message: detail },
  };
  ws.send(JSON.stringify(err));
}

export async function handleMouseMove(ws: WebSocket, msg: MouseMoveMessage): Promise<void> {
  try {
    const current = await mouse.getPosition();
    const target = new Point(current.x + msg.payload.dx, current.y + msg.payload.dy);
    await mouse.setPosition(target);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'mouse move failed';
    console.error('[mouse] move failed:', detail);
    sendInjectionError(ws, detail);
  }
}

export async function handleMouseClick(ws: WebSocket, msg: MouseClickMessage): Promise<void> {
  try {
    const btn = BUTTON_MAP[msg.payload.button];
    await mouse.click(btn);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'mouse click failed';
    console.error('[mouse] click failed:', detail);
    sendInjectionError(ws, detail);
  }
}

export async function handleMouseScroll(ws: WebSocket, msg: MouseScrollMessage): Promise<void> {
  const { dy } = msg.payload;
  if (dy === 0) return;

  try {
    if (dy > 0) {
      await mouse.scrollDown(dy);
    } else {
      await mouse.scrollUp(Math.abs(dy));
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'mouse scroll failed';
    console.error('[mouse] scroll failed:', detail);
    sendInjectionError(ws, detail);
  }
}
