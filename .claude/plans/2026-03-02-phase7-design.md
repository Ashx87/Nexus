# Phase 7: Integration, Polish & Packaging — Design Document

**Date**: 2026-03-02
**Status**: Approved

---

## 1. Scope

All P0 and P1 items from the development plan:

| Priority | Task |
|----------|------|
| P0 | Package server as Windows `.exe` (pkg) |
| P0 | End-to-end testing & bug fixes |
| P1 | Global settings page (sensitivity, theme, port, about) |
| P1 | Tab bar UI polish with icons |
| P1 | System tray + auto-start on boot (node-systray) |
| P1 | Performance review |

---

## 2. Architecture

### Client Changes (React Native / Expo)

```
client/src/
├── App.tsx                                # Tab Bar upgrade: icons + text, gear button → Settings modal
├── modules/
│   └── settings/                          # New module
│       ├── screens/SettingsScreen.tsx     # Sensitivity · Theme · Port · About
│       ├── hooks/useSettings.ts           # Read/write settings
│       └── services/settingsStorage.ts   # AsyncStorage persistence
└── stores/
    └── settingsStore.ts                   # New: theme / sensitivity / serverPort global state
```

**Tab Bar icons** (Ionicons from `@expo/vector-icons`, already bundled in Expo):
- Touchpad → `hand-right-outline`
- Keyboard → `keypad-outline`
- Media → `musical-notes-outline`
- Macros → `flash-outline`
- Clipboard → `clipboard-outline`

A gear button floats at the right end of the tab bar. Pressing it opens a full-screen `<Modal>` containing `SettingsScreen`.

### Server Changes (Node.js)

```
server/
├── src/
│   ├── modules/
│   │   └── tray.ts                  # New: node-systray system tray logic
│   └── index.ts                     # Initialize tray on startup
├── assets/
│   └── icon.ico                     # Tray icon
├── scripts/
│   └── build-exe.sh                 # pkg packaging script
└── package.json                     # Added: pkg + node-systray dependencies
```

---

## 3. Key Components

### 3.1 settingsStore (Zustand)

```typescript
interface SettingsState {
  theme: 'light' | 'dark' | 'system'
  sensitivity: number       // moved here from touchpadStore
  serverPort: number        // default 9001, persisted to AsyncStorage
}
```

### 3.2 SettingsScreen sections
1. Touchpad — sensitivity slider
2. Appearance — theme picker (Light / Dark / System)
3. Connection — server port text input (validates 1024–65535)
4. About — app name, version

### 3.3 Windows .exe Packaging (pkg)

```json
{
  "scripts": {
    "build:exe": "npm run build && pkg dist/index.js --target node18-win-x64 --output nexus-server.exe"
  },
  "pkg": {
    "assets": ["node_modules/@nut-tree-fork/nut-js/lib/provider/native/**/*.node"],
    "targets": ["node18-win-x64"]
  }
}
```

### 3.4 System Tray (node-systray)

Menu:
```
[Nexus — No clients connected]  (status, disabled)
─────────────────────────────────
Start on Boot                   (checkbox toggle)
─────────────────────────────────
Quit
```

Auto-start: write/delete `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` via `reg` CLI.

---

## 4. Error Handling

| Scenario | Handling |
|----------|----------|
| nut.js .node file missing after pkg build | Detect at startup, log clear error and exit |
| node-systray init fails (non-Windows) | try-catch, degrade to no-tray mode |
| User sets invalid port, connection fails | SettingsScreen shows red inline error, retains last valid port |
| Auto-start registry write fails | Tray menu shows "Cannot set (admin required)" |

---

## 5. Testing Plan

### Existing Tests (must stay green)
- `cd server && npm test`
- `cd client && npm test`

### New Unit Tests
- `settingsStore.test.ts` — theme/sensitivity/port CRUD + persistence
- `tray.test.ts` — tray init logic (mock node-systray)

### Manual E2E Checklist
- [ ] .exe starts without error on Windows
- [ ] Tray icon appears in system tray
- [ ] Tray menu items respond correctly
- [ ] "Start on Boot" toggle persists across reboots
- [ ] iOS app connects to server started from .exe
- [ ] All 6 modules work end-to-end via .exe
- [ ] Settings page saves and restores after app restart
- [ ] Theme toggle applies globally across all screens
- [ ] Sensitivity setting persists and affects touchpad behavior

---

## 6. Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| .exe packaging | pkg | Specified in dev plan; mature, produces single exe |
| System tray | node-systray | Cross-platform npm package, minimal footprint |
| Settings UI | Modal (gear icon) | Keeps tab count ≤ 5 per iOS HIG |
| Settings items | Sensitivity, Theme, Port, About | User confirmed |
