// ─── Heartbeat timing constants ───────────────────────────────────────────────
export const HEARTBEAT_INTERVAL_MS = 5000; // client sends ping every 5s
export const HEARTBEAT_TIMEOUT_MS = 15000; // server drops connection after 15s silence

// ─── Reconnect constants ──────────────────────────────────────────────────────
export const RECONNECT_BASE_DELAY_MS = 1000;
export const RECONNECT_MAX_DELAY_MS = 30000;
export const RECONNECT_MAX_ATTEMPTS = 10;

// ─── Module names ─────────────────────────────────────────────────────────────
export type Module =
  | 'connection'
  | 'mouse'
  | 'keyboard'
  | 'media'
  | 'macro'
  | 'clipboard';

// ─── Base envelope ────────────────────────────────────────────────────────────
export interface NexusMessage<
  M extends Module = Module,
  A extends string = string,
  P = unknown,
> {
  module: M;
  action: A;
  payload: P;
}

// ─── Connection module ────────────────────────────────────────────────────────
export type PingMessage = NexusMessage<'connection', 'ping', Record<string, never>>;
export type PongMessage = NexusMessage<'connection', 'pong', Record<string, never>>;
export type AuthMessage = NexusMessage<'connection', 'auth', { code: string }>;
export type AuthResultMessage = NexusMessage<
  'connection',
  'auth_result',
  { success: boolean }
>;
export type ErrorMessage = NexusMessage<
  'connection',
  'error',
  { code: ErrorCode; message: string }
>;

export type ServerInfoMessage = NexusMessage<
  'connection',
  'server_info',
  { name: string; version: string }
>;

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export type ErrorCode =
  | 'INVALID_JSON'
  | 'UNKNOWN_MODULE'
  | 'UNKNOWN_ACTION'
  | 'PAYLOAD_INVALID'
  | 'INJECTION_FAILED';

// ─── Mouse module ─────────────────────────────────────────────────────────────
export type MouseButton = 'left' | 'right' | 'middle';

export type MouseMoveMessage = NexusMessage<'mouse', 'move', { dx: number; dy: number }>;
export type MouseClickMessage = NexusMessage<'mouse', 'click', { button: MouseButton }>;
export type MouseScrollMessage = NexusMessage<'mouse', 'scroll', { dy: number }>;

// ─── Keyboard module ──────────────────────────────────────────────────────────
export type KeyboardTypeMessage = NexusMessage<'keyboard', 'type', { text: string }>;
export type KeyboardKeyMessage = NexusMessage<'keyboard', 'key', { key: string }>;
export type KeyboardComboMessage = NexusMessage<'keyboard', 'combo', { keys: string[] }>;

// ─── Media module ─────────────────────────────────────────────────────────────
export type MediaCmd =
  | 'play_pause'
  | 'next'
  | 'prev'
  | 'volume_up'
  | 'volume_down'
  | 'mute';

export type MediaControlMessage = NexusMessage<'media', 'control', { cmd: MediaCmd }>;

// ─── Macro module ─────────────────────────────────────────────────────────────
export type MacroStepKeyCombo = { readonly type: 'key_combo'; readonly keys: string[]; readonly delay: number };
export type MacroStepKey = { readonly type: 'key'; readonly key: string; readonly delay: number };
export type MacroStepTypeText = { readonly type: 'type_text'; readonly text: string; readonly delay: number };
export type MacroStepWait = { readonly type: 'wait'; readonly ms: number };

export type MacroStep = MacroStepKeyCombo | MacroStepKey | MacroStepTypeText | MacroStepWait;

export interface MacroDefinition {
  readonly macroId: string;
  readonly name: string;
  readonly icon: string;
  readonly color: string;
  readonly steps: readonly MacroStep[];
  readonly isPreset: boolean;
  readonly order: number;
}

export const MAX_MACRO_STEPS = 50;
export const MAX_WAIT_MS = 30_000;

export type MacroExecuteMessage = NexusMessage<'macro', 'execute', { macroId: string; steps: readonly MacroStep[] }>;
export type MacroResultMessage = NexusMessage<'macro', 'result', { macroId: string; success: boolean; error?: string }>;

// ─── Clipboard module ─────────────────────────────────────────────────────────
export type ClipboardDirection = 'phone_to_pc' | 'pc_to_phone';
export type ClipboardContentType = 'text' | 'image';
export type ClipboardImageMimeType = 'image/png' | 'image/jpeg';

export const CLIPBOARD_MAX_TEXT_BYTES = 1_048_576;    // 1 MB
export const CLIPBOARD_MAX_IMAGE_BYTES = 52_428_800;  // 50 MB
export const CLIPBOARD_CHUNK_SIZE = 65_536;           // 64 KB per binary chunk
export const CLIPBOARD_POLL_INTERVAL_MS = 1_000;
export const CLIPBOARD_DEBOUNCE_MS = 500;
export const CLIPBOARD_TRANSFER_TIMEOUT_MS = 10_000;
export const CLIPBOARD_MAX_HISTORY = 50;

export type ClipboardSyncMessage = NexusMessage<
  'clipboard',
  'sync',
  { content: string; direction: ClipboardDirection }
>;

export type ClipboardRequestMessage = NexusMessage<
  'clipboard',
  'request',
  { direction: 'pc_to_phone' }
>;

export type ClipboardImageMetaMessage = NexusMessage<
  'clipboard',
  'image_meta',
  {
    transferId: string;
    direction: ClipboardDirection;
    mimeType: ClipboardImageMimeType;
    size: number;
    width: number;
    height: number;
    totalChunks: number;
  }
>;

export type ClipboardImageCompleteMessage = NexusMessage<
  'clipboard',
  'image_complete',
  { transferId: string; success: boolean; error?: string }
>;

export type ClipboardNotifyMessage = NexusMessage<
  'clipboard',
  'notify',
  { type: ClipboardContentType; preview?: string; timestamp: number }
>;

// ─── Union of all inbound messages (server receives from client) ──────────────
export type InboundMessage =
  | PingMessage
  | AuthMessage
  | MouseMoveMessage
  | MouseClickMessage
  | MouseScrollMessage
  | KeyboardTypeMessage
  | KeyboardKeyMessage
  | KeyboardComboMessage
  | MediaControlMessage
  | MacroExecuteMessage
  | ClipboardSyncMessage
  | ClipboardRequestMessage
  | ClipboardImageMetaMessage
  | ClipboardImageCompleteMessage;

// ─── Union of all outbound messages (server sends to client) ──────────────────
export type OutboundMessage =
  | PongMessage
  | AuthResultMessage
  | ErrorMessage
  | ServerInfoMessage
  | MacroResultMessage
  | ClipboardSyncMessage
  | ClipboardImageMetaMessage
  | ClipboardImageCompleteMessage
  | ClipboardNotifyMessage;
