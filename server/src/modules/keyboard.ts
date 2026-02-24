import { WebSocket } from 'ws';
import { KeyboardTypeMessage, KeyboardKeyMessage, KeyboardComboMessage } from '@nexus/shared';

export function handleKeyboardType(_ws: WebSocket, msg: KeyboardTypeMessage): void {
  console.log(`[keyboard] type text="${msg.payload.text}"`);
}

export function handleKeyboardKey(_ws: WebSocket, msg: KeyboardKeyMessage): void {
  console.log(`[keyboard] key key=${msg.payload.key}`);
}

export function handleKeyboardCombo(_ws: WebSocket, msg: KeyboardComboMessage): void {
  console.log(`[keyboard] combo keys=${msg.payload.keys.join('+')}`);
}
