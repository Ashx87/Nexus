import { WebSocket } from 'ws';
import { createHash } from 'crypto';
import clipboard from 'clipboardy';
import {
  ClipboardSyncMessage,
  CLIPBOARD_POLL_INTERVAL_MS,
  CLIPBOARD_DEBOUNCE_MS,
} from '@nexus/shared';

export class ClipboardWatcher {
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastHash = '';
  private lastPushTime = 0;
  private ws: WebSocket | null = null;

  start(ws: WebSocket): void {
    this.ws = ws;
    this.lastHash = '';
    this.lastPushTime = 0;

    this.timer = setInterval(() => {
      void this.poll();
    }, CLIPBOARD_POLL_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.ws = null;
  }

  private async poll(): Promise<void> {
    if (this.ws === null || this.ws.readyState !== 1) {
      return;
    }

    try {
      const text = await clipboard.read();
      const hash = createHash('sha256').update(text).digest('hex');

      if (hash === this.lastHash) {
        return;
      }

      // First poll — set baseline without pushing
      if (this.lastHash === '') {
        this.lastHash = hash;
        return;
      }

      // Debounce rapid changes
      const now = Date.now();
      if (now - this.lastPushTime < CLIPBOARD_DEBOUNCE_MS) {
        return;
      }

      this.lastHash = hash;
      this.lastPushTime = now;

      const msg: ClipboardSyncMessage = {
        module: 'clipboard',
        action: 'sync',
        payload: { content: text, direction: 'pc_to_phone' },
      };
      this.ws.send(JSON.stringify(msg));
      console.log(`[clipboard-watcher] pushed ${text.length} chars to client`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'unknown';
      console.error('[clipboard-watcher] poll error:', detail);
    }
  }
}
