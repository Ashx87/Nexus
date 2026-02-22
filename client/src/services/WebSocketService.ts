import {
  HEARTBEAT_INTERVAL_MS,
  RECONNECT_BASE_DELAY_MS,
  RECONNECT_MAX_DELAY_MS,
  RECONNECT_MAX_ATTEMPTS,
  NexusMessage,
  OutboundMessage,
  ConnectionStatus,
} from '@nexus/shared';
import { logger } from '../utils/logger';

export interface StatusMeta {
  readonly attempt?: number;
  readonly maxAttempts?: number;
}

type MessageHandler = (msg: OutboundMessage) => void;
type StatusHandler = (status: ConnectionStatus, meta?: StatusMeta) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private url = '';
  private intentionallyClosed = false;

  connect(host: string, port: number): void {
    this.url = `ws://${host}:${port}`;
    this.intentionallyClosed = false;
    this.reconnectAttempts = 0;
    this._connect();
  }

  private _connect(): void {
    this._setStatus('connecting');
    logger.log('ws', `connecting to ${this.url}`);

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this._startHeartbeat();
      this._setStatus('connected');
      logger.log('ws', 'connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as OutboundMessage;
        this.messageHandlers.forEach((h) => h(msg));
      } catch {
        logger.error('ws', 'failed to parse incoming message');
      }
    };

    this.ws.onclose = () => {
      this._stopHeartbeat();
      if (!this.intentionallyClosed) {
        this._scheduleReconnect();
      } else {
        this._setStatus('disconnected');
      }
    };

    this.ws.onerror = () => {
      logger.error('ws', 'connection error');
    };
  }

  disconnect(): void {
    this.intentionallyClosed = true;
    this._stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    this._setStatus('disconnected');
  }

  send(msg: NexusMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      logger.warn('ws', 'attempted send while not connected');
    }
  }

  addMessageHandler(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  addStatusHandler(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private _setStatus(status: ConnectionStatus, meta?: StatusMeta): void {
    this.statusHandlers.forEach((h) => h(status, meta));
  }

  private _startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send({ module: 'connection', action: 'ping', payload: {} });
    }, HEARTBEAT_INTERVAL_MS);
  }

  private _stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private _scheduleReconnect(): void {
    if (this.reconnectAttempts >= RECONNECT_MAX_ATTEMPTS) {
      logger.error('ws', 'max reconnect attempts reached');
      this._setStatus('error');
      return;
    }
    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * Math.pow(2, this.reconnectAttempts),
      RECONNECT_MAX_DELAY_MS,
    );
    this.reconnectAttempts += 1;
    this._setStatus('reconnecting', {
      attempt: this.reconnectAttempts,
      maxAttempts: RECONNECT_MAX_ATTEMPTS,
    });
    logger.log('ws', `reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.reconnectTimer = setTimeout(() => this._connect(), delay);
  }
}

export const wsService = new WebSocketService();

export type { ConnectionStatus };
