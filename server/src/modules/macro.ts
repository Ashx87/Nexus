import { WebSocket } from 'ws';
import { MacroExecuteMessage } from '@nexus/shared';

export function handleMacroExecute(_ws: WebSocket, msg: MacroExecuteMessage): void {
  console.log(`[macro] execute macroId=${msg.payload.macroId}`);
}
