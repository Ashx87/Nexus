# Nexus

[中文](README.zh.md)

**Nexus** is an iOS app that turns your iPhone into a wireless remote control for your Windows PC over local Wi-Fi. The iOS client sends commands via WebSocket; the Windows server injects them into the OS using native APIs.

## Features

| Feature | Description |
|---------|-------------|
| **Touchpad** | Multi-touch gestures → mouse move, click, right-click, scroll |
| **Virtual Keyboard** | Text input, function keys (F1–F12), modifier lock (Ctrl/Alt/Shift/Win), key combos |
| **Media Controls** | Play/pause, next/previous track, volume up/down, mute |
| **Macros / Shortcuts** | Built-in presets + custom step macros, drag-to-reorder, import/export |
| **Clipboard Sync** | Bi-directional text & image sync between phone and PC, with history |
| **System Tray** | Windows tray icon, auto-start on login, settings UI |

## Architecture

```
iOS Client (React Native)  <-->  WebSocket (JSON)  <-->  Windows Server (Node.js)
        client/                                              server/
                          packages/shared/
                       (shared TypeScript types)
```

Three independent packages, each with their own `package.json`:

- **`packages/shared/`** — TypeScript types and constants shared by both sides (must be built first)
- **`client/`** — React Native iOS app (Expo SDK 54)
- **`server/`** — Node.js Windows service

## Quick Start

### Prerequisites

- **Server**: Node.js 18+ (Windows), cmake (for nut.js native modules)
- **Client**: Node.js 18+, iPhone with Expo Go installed, or an EAS Dev Build

### Install & Run

```bash
# 1. Install dependencies for all three packages
cd packages/shared && npm install
cd ../server && npm install
cd ../client && npm install

# 2. Build shared types (required after any change to protocol.ts)
cd ../packages/shared && npm run build

# 3. Start the server (terminal 1)
cd ../server && npm run dev

# 4. Start the client Metro bundler (terminal 2)
cd ../client && npx expo start
# -> Open Expo Go on your iPhone -> scan the QR code
```

### Firewall

The server listens on **port 9001** by default. Open this port in Windows Firewall on first run (the server prints a reminder on startup).

## Development Commands

### Shared types

```bash
cd packages/shared
npm run build        # rebuild after any change to protocol.ts
```

### Server

```bash
cd server
npm run dev          # ts-node-dev with hot reload
npm test             # Jest unit tests
npm run build        # compile to dist/
npm run build:exe    # package as nexus-server.exe (pkg)
```

### Client

```bash
cd client
npx expo start                                              # start Metro (scan QR with Expo Go)
npx eas-cli build --profile development --platform ios     # EAS development build (first time)
npx eas-cli build --profile production --platform ios      # EAS production IPA
```

### Connectivity test

```bash
# Run after the server is started
node server/scripts/test-client.js 127.0.0.1 9001
```

## Communication Protocol

All messages are sent over WebSocket as a unified JSON envelope:

```json
{ "module": "mouse|keyboard|media|macro|clipboard", "action": "action_name", "payload": {} }
```

### Message Types

| Module | Action | Payload |
|--------|--------|---------|
| `connection` | `ping` / `pong` | `{}` |
| `connection` | `server_info` | `{ name, version }` |
| `mouse` | `move` | `{ dx, dy }` |
| `mouse` | `click` | `{ button: "left/right/middle" }` |
| `mouse` | `scroll` | `{ dy }` |
| `keyboard` | `type` | `{ text }` |
| `keyboard` | `key` | `{ key }` |
| `keyboard` | `combo` | `{ keys[] }` |
| `media` | `control` | `{ cmd: "play_pause/next/prev/volume_up/volume_down/mute" }` |
| `macro` | `execute` | `{ macroId, steps[] }` |
| `clipboard` | `sync` | `{ content, direction: "phone_to_pc/pc_to_phone" }` |

Full type definitions: [`packages/shared/src/protocol.ts`](packages/shared/src/protocol.ts)

## Directory Structure

```
nexus/
├── packages/shared/src/
│   └── protocol.ts          # All WebSocket message types and constants
├── client/src/
│   ├── modules/
│   │   ├── connection/      # Connection manager (IP input, auto-reconnect UI)
│   │   ├── touchpad/        # Touch gestures -> mouse events
│   │   ├── keyboard/        # Virtual keyboard (text, function keys, modifiers)
│   │   ├── media/           # Media controls
│   │   ├── macro/           # Macro manager (presets + custom + step editor)
│   │   ├── clipboard/       # Clipboard sync
│   │   └── settings/        # App settings
│   ├── services/
│   │   └── WebSocketService.ts   # Singleton: connect / heartbeat / reconnect
│   └── stores/
│       ├── connectionStore.ts    # Zustand: connection state
│       └── keyboardStore.ts      # Zustand: modifier lock state
└── server/src/
    ├── modules/             # One file per protocol module
    ├── server.ts            # WebSocket server lifecycle
    ├── router.ts            # JSON parse + dispatch by module field
    ├── discovery.ts         # bonjour-service mDNS broadcast
    └── utils/               # Utilities
```

## Tech Stack

| Concern | Technology |
|---------|-----------|
| iOS Client | Expo SDK 54 + React Native 0.81 + TypeScript |
| iOS Build | EAS Build (cloud — no Mac required) |
| Daily Dev | Expo Go (no native modules needed) |
| State Management | Zustand |
| Server Runtime | Node.js + TypeScript, `ws` package |
| Mouse/Keyboard Injection | `@nut-tree-fork/nut-js` |
| Media Volume | `loudness` |
| Clipboard | `clipboardy` |
| Server Packaging | `pkg` -> `.exe` + `systray2` tray |

## Macro Data Format

Macros are stored in AsyncStorage and sent to the server as JSON at execution time:

```json
{
  "macroId": "open_terminal",
  "name": "Open Terminal",
  "icon": "terminal",
  "color": "#4A90D9",
  "steps": [
    { "type": "key_combo", "keys": ["win", "r"], "delay": 0 },
    { "type": "wait", "ms": 500 },
    { "type": "type_text", "text": "cmd", "delay": 0 },
    { "type": "key", "key": "enter", "delay": 0 }
  ]
}
```

## License

[MIT](LICENSE)
