# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## User Preferences

### Git Commit Strategy
- **Always make granular commits** — one logical change per commit, never batch unrelated changes together.
- Example: adding a feature, writing its test, and updating config are separate commits.

## Project Overview

**Nexus** is an iOS app (React Native) that remotely controls a Windows PC over local Wi-Fi. The iOS client sends commands via WebSocket; the Windows server injects them into the OS using native APIs.

Full development plan: `docs/dev-plan/development-plan-en.md`

## Architecture

```
iOS Client (React Native)  ←→  WebSocket (JSON)  ←→  Windows Server (Node.js)
         client/                                            server/
                         packages/shared/
                      (shared TypeScript types)
```

Three packages, each with its own `package.json`:
- **`packages/shared/`** — TypeScript types and constants shared by both sides (built first)
- **`client/`** — React Native iOS app
- **`server/`** — Node.js Windows service

## Quick Start (Fresh Clone)

```bash
# 1. Install dependencies for all three packages
cd packages/shared && npm install
cd ../server && npm install
cd ../client && npm install

# 2. Build shared types (required before server or client can compile)
cd ../packages/shared && npm run build

# 3. Start server (in one terminal)
cd ../server && npm run dev

# 4. Start client Metro (in another terminal)
cd ../client && npx expo start
# → Open Expo Go on iPhone → scan QR code
```

## Development Commands

### Shared types (must rebuild after any change to `protocol.ts`)
```bash
cd packages/shared && npm run build
```

### Server
```bash
cd server
npm run dev      # ts-node-dev hot reload
npm test         # jest unit tests
npm run build    # compile to dist/
```

### E2E connectivity test (server must be running)
```bash
node server/scripts/test-client.js 127.0.0.1 9001
```

### Client (Expo — iOS via Expo Go on iPhone, cloud build via EAS)
```bash
cd client
npx expo start                          # start Metro dev server → scan QR with Expo Go on iPhone
npx eas-cli build --profile development --platform ios   # cloud iOS build (first time per device)
npx eas-cli build --profile production --platform ios    # cloud production IPA
```

## Communication Protocol

All messages use a unified JSON envelope over WebSocket:

```json
{ "module": "mouse|keyboard|media|macro|clipboard", "action": "action_name", "payload": {} }
```

Key message types:
- `connection` → `ping {}` / `pong {}` / `error { code, message }` / `server_info { name, version }` (server → client on connect)
- `mouse` → `move { dx, dy }`, `click { button }`, `scroll { dy }`
- `keyboard` → `type { text }`, `key { key }`, `combo { keys[] }`
- `media` → `control { cmd: "play_pause|next|prev|volume_up|volume_down|mute" }`
- `macro` → `execute { macroId }`
- `clipboard` → `sync { content, direction: "phone_to_pc|pc_to_phone" }`

All protocol types are in `packages/shared/src/protocol.ts`. All constants (`HEARTBEAT_INTERVAL_MS`, etc.) come from there — never duplicate them.

## Directory Structure

```
client/src/
├── modules/
│   ├── connection/   # Phase 1: ConnectionScreen, StatusBadge, ConnectionForm, ReconnectBanner
│   │   ├── components/   # StatusBadge, ConnectionForm, ReconnectBanner
│   │   ├── hooks/        # useConnection (orchestrates store + service + persistence)
│   │   ├── screens/      # ConnectionScreen
│   │   └── services/     # serverStorage (AsyncStorage last-server persistence)
│   ├── touchpad/     # Phase 2: Gesture capture → mouse events
│   ├── keyboard/     # Phase 3: Text input, function keys, combos, modifier lock
│   ├── media/        # Phase 4: Play/pause/volume controls
│   ├── macro/        # Phase 5: Preset shortcuts, custom macros, step sequencer
│   └── clipboard/    # Phase 6: Bi-directional clipboard sync
├── services/
│   └── WebSocketService.ts  # Singleton: connect/disconnect/send/heartbeat/reconnect
├── stores/
│   ├── connectionStore.ts   # Zustand: connection status + host/port
│   └── keyboardStore.ts     # Zustand: modifier lock state (Ctrl/Alt/Shift/Win)
└── utils/
    └── logger.ts            # Dev-only logging wrapper

server/src/
├── modules/         # One file per protocol module (connection/mouse/keyboard/...)
├── config.ts        # Port, heartbeat timing from env vars
├── server.ts        # WebSocket server lifecycle
├── router.ts        # JSON parse + dispatch by module field
└── discovery.ts     # bonjour-service mDNS broadcast
```

## Tech Stack (Confirmed)

| Concern | Technology |
|---------|-----------|
| iOS Client | **Expo SDK 54** (bare workflow) + React Native 0.81 + TypeScript |
| iOS Build | **EAS Build** (cloud) — no Mac required for building |
| Daily Dev | **Expo Go** on iPhone (Phase 0–0.x) → EAS Dev Build (Phase 1+ with native modules) |
| State management | **Zustand** |
| Device discovery | **react-native-zeroconf** (mDNS, Phase 1+) |
| Server runtime | **Node.js + TypeScript**, `ws` package |
| Mouse/keyboard injection | **`nut.js`** (install at Phase 2 start — requires native build) |
| Media keys / volume | `loudness` (install at Phase 4) |
| Clipboard | `clipboardy` (install at Phase 6) |
| Server packaging | `pkg` → `.exe` (Phase 7) |

## Important Setup Notes

- **`packages/shared` must be built** before either server or client TypeScript can compile: `cd packages/shared && npm run build`
- **`nut.js` is NOT installed in Phase 0** — requires cmake/native build tools. Install at start of Phase 2.
- **iOS local network permission**: `NSLocalNetworkUsageDescription`, `NSBonjourServices`, and `NSAllowsLocalNetworking` are configured in `client/app.json` under `expo.ios.infoPlist` — applied to native code via `expo prebuild`.
- **Windows Firewall**: Port 9001 must be opened for clients to connect. Server prints a reminder on startup.
- **Metro bundler**: `client/metro.config.js` declares `watchFolders` for `packages/shared` — required for `@nexus/shared` to resolve.
- **`bonjour-service` fallback**: If mDNS fails on Windows, server logs the manual IP at startup (`ws://[IP]:9001`).
- **EAS project setup** (one-time): `cd client && npx eas-cli@latest login && npx eas-cli@latest build:configure` — links the project to your Expo account and writes `projectId` to `app.json`.
- **Expo Go limitations**: Expo Go does not support custom native modules. When Phase 1 adds `react-native-zeroconf`, build an EAS Development Build once and use that for further development.
- **client/ios/ and client/android/ are gitignored** — generated by `expo prebuild`. Run `npx expo prebuild` if you need to inspect or customize native code.
- **`babel-preset-expo` must be explicit**: `create-expo-app bare-minimum` does not include it — always run `npm install --save-dev babel-preset-expo` after scaffolding the client, or Metro will fail with `Cannot find module 'babel-preset-expo'`.
- **EAS CLI**: Use `npx eas-cli <command>` (no global install needed), or `npm install -g eas-cli` once to use the short `eas <command>` form directly.

## Macro Data Format

Macros stored in AsyncStorage and sent to server as JSON:

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

## Development Phases

Current phase: **Phase 5 complete — starting Phase 6 (Clipboard Sync)**. Phases:

0. ✅ Project setup + protocol spec + scaffolding
1. ✅ Connection Manager (manual IP, auto-reconnect UI, server info — mDNS/pairing deferred)
2. ✅ Touchpad / Mouse (gestures → cursor, throttle to 60/s)
3. ✅ Virtual Keyboard (text + function keys + combos + modifier lock)
4. ✅ Media Control (media keys + volume)
5. ✅ Shortcuts / Macros (preset + custom + step sequencer + drag-reorder + import/export)
6. Clipboard Sync (bi-directional text)
7. Integration, polish, Windows `.exe` packaging

## Key Implementation Notes

- **Gesture Handler + Reanimated**: When `react-native-reanimated` is installed, `react-native-gesture-handler` v2 runs callbacks as worklets on the UI thread by default. Any gesture callback that calls regular JS (Zustand, WebSocket, refs) **must** chain `.runOnJS(true)` or the app will crash on touch.
- **Touchpad events** must be throttled to 60–120/sec client-side; apply acceleration curve server-side.
- **Modifier keys** (Ctrl, Alt, Win, Shift) must support a "locked" state for multi-tap combos.
- **iOS clipboard** (iOS 14+) triggers permission alerts — only access on explicit user action.
- **Server input injection** may be blocked by Windows security software; whitelist steps must be documented for users.
- **Heartbeat**: client sends application-layer `ping` every 5s; server drops connection after 15s silence. Server also sends WS-protocol `ws.ping()` separately to detect broken TCP.
- **Server tests**: `createServer({ port: 0 })` for random port in Jest — avoids port conflicts.
- **No Python on this machine** — use `node -e` for scripting, not `python3`.
- **This is a React Native app** — preview_* tools don't apply. Verify via `npx tsc --noEmit`, `npm test`, and manual Expo Go testing.
- **Daily dev uses Expo Go** — no native modules (react-native-zeroconf) until EAS Dev Build is set up.
- **Zustand + Set mutation**: Creating `new Set(existing)` then calling `.add()`/`.delete()` is a mutation violation even on a fresh Set. Use filter+spread: `new Set([...state.set].filter(k => k !== key))` / `new Set([...state.set, key])`.
- **nut.js Key enum inspection**: `cd server && node -e "const {Key}=require('@nut-tree-fork/nut-js'); console.log(Object.keys(Key).filter(k=>isNaN(Number(k))).join(', '))"` — lists all available keys before building a KEY_MAP.
- **Tab navigation**: App.tsx currently has 4 tabs (Touchpad, Keyboard, Media, Macros) using simple `useState`. Consider react-navigation if more tabs or deep linking is needed.
- **Macro execution is fire-and-forget + result callback**: Client sends `MacroExecuteMessage` with full steps, server executes and sends back `MacroResultMessage`. Client listens via `wsService.addMessageHandler` in `useMacro` hook.
- **react-native-draggable-flatlist** requires `GestureHandlerRootView` (already present in App.tsx). Use `numColumns={2}` for grid layout.
- **expo-sharing + expo-file-system** for macro import/export — works in Expo Go without native modules.
- **TextInput diff on iOS**: `computeTextDiff(prev, next)` must use `deletedCount = prev.length - prefixLen` (not `Math.max(0, prev.length - next.length)`) to correctly handle mid-string replacement (select+type).
- **JSX comments in React Native (Fabric)**: `<View />{/* comment */}` NOT `<View /> {/* comment */}` — space before `{/*` is compiled as a text string `" "` and crashes Fabric renderer with "Text strings must be rendered within a <Text> component".
