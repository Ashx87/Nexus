# Phase 7: Integration, Polish & Packaging — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish the iOS client UI (tab icons, settings page, dark mode), package the server as a Windows .exe, and add system tray + auto-start.

**Architecture:** New `settingsStore` holds theme/port; existing `touchpadStore` keeps sensitivity. Settings exposed via full-screen Modal opened from a gear icon in the tab bar. Server packaged with `pkg`; tray managed by `node-systray` with registry-based auto-start.

**Tech Stack:** `@expo/vector-icons` (Ionicons, already in Expo), `pkg` (server bundler), `node-systray` (Windows tray), React Native `useColorScheme`, `child_process` (registry writes)

---

## Task 1: Tab Bar icons in App.tsx

**Files:**
- Modify: `client/App.tsx`

**Step 1: Verify current tests pass before changing anything**

```bash
cd client && npm test -- --passWithNoTests
```
Expected: all pass

**Step 2: Add Ionicons import and tab icon map to App.tsx**

Add at top of file:
```tsx
import { Ionicons } from '@expo/vector-icons';
```

Add above the component:
```tsx
const TAB_ICONS: Record<ActiveTab, keyof typeof Ionicons.glyphMap> = {
  touchpad:  'hand-right-outline',
  keyboard:  'keypad-outline',
  media:     'musical-notes-outline',
  macro:     'flash-outline',
  clipboard: 'clipboard-outline',
};
```

**Step 3: Replace each Pressable tab content to show icon + label**

Example for touchpad (repeat pattern for all 5 tabs):
```tsx
<Pressable
  style={[styles.tab, activeTab === 'touchpad' && styles.tabActive]}
  onPress={() => setActiveTab('touchpad')}
>
  <Ionicons
    name={TAB_ICONS.touchpad}
    size={22}
    color={activeTab === 'touchpad' ? '#007aff' : '#8e8e93'}
  />
  <Text style={[styles.tabText, activeTab === 'touchpad' && styles.tabTextActive]}>
    Touchpad
  </Text>
</Pressable>
```

Update `tabBar` height to 60, `tab` gap to 2, `tabText` fontSize to 10:
```tsx
tabBar: {
  flexDirection: 'row',
  backgroundColor: '#ffffff',
  borderTopWidth: 1,
  borderTopColor: '#c8c8ce',
  height: 60,
  paddingBottom: 4,
},
tab: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
},
tabText: { fontSize: 10, color: '#8e8e93', fontWeight: '500' },
tabTextActive: { color: '#007aff', fontWeight: '600' },
```

**Step 4: Run tests**

```bash
cd client && npm test
```
Expected: all pass

**Step 5: Commit**

```bash
git add client/App.tsx
git commit -m "feat(client): upgrade tab bar with Ionicons + text labels"
```

---

## Task 2: Theme color constants

**Files:**
- Create: `client/src/theme/colors.ts`

**Step 1: Create the file (no test needed for pure data)**

```typescript
// client/src/theme/colors.ts
export interface ThemeColors {
  readonly background: string;
  readonly surface: string;
  readonly primary: string;
  readonly text: string;
  readonly textSecondary: string;
  readonly border: string;
  readonly tabBarBg: string;
  readonly tabBarBorder: string;
  readonly destructive: string;
}

export const lightColors: ThemeColors = {
  background:    '#f2f2f7',
  surface:       '#ffffff',
  primary:       '#007aff',
  text:          '#1c1c1e',
  textSecondary: '#8e8e93',
  border:        '#c8c8ce',
  tabBarBg:      '#ffffff',
  tabBarBorder:  '#c8c8ce',
  destructive:   '#ff3b30',
};

export const darkColors: ThemeColors = {
  background:    '#1c1c1e',
  surface:       '#2c2c2e',
  primary:       '#0a84ff',
  text:          '#ffffff',
  textSecondary: '#8e8e93',
  border:        '#3a3a3c',
  tabBarBg:      '#1c1c1e',
  tabBarBorder:  '#3a3a3c',
  destructive:   '#ff453a',
};
```

**Step 2: Commit**

```bash
git add client/src/theme/colors.ts
git commit -m "feat(client): add light/dark theme color constants"
```

---

## Task 3: settingsStore + settingsStorage

**Files:**
- Create: `client/src/stores/settingsStore.ts`
- Create: `client/src/modules/settings/services/settingsStorage.ts`
- Create: `client/src/stores/__tests__/settingsStore.test.ts`

**Step 1: Write the failing test**

Create `client/src/stores/__tests__/settingsStore.test.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettingsStore } from '../settingsStore';

beforeEach(() => {
  useSettingsStore.setState({
    theme: 'system',
    serverPort: 9001,
    settingsLoaded: false,
  });
  jest.clearAllMocks();
});

describe('settingsStore', () => {
  it('has correct initial state', () => {
    const { theme, serverPort } = useSettingsStore.getState();
    expect(theme).toBe('system');
    expect(serverPort).toBe(9001);
  });

  it('setTheme updates theme', () => {
    useSettingsStore.getState().setTheme('dark');
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('setServerPort clamps to valid range', () => {
    useSettingsStore.getState().setServerPort(80);
    expect(useSettingsStore.getState().serverPort).toBe(1024);
    useSettingsStore.getState().setServerPort(99999);
    expect(useSettingsStore.getState().serverPort).toBe(65535);
    useSettingsStore.getState().setServerPort(3000);
    expect(useSettingsStore.getState().serverPort).toBe(3000);
  });

  it('initSettings loads persisted values', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ theme: 'dark', serverPort: 9002 })
    );
    await useSettingsStore.getState().initSettings();
    expect(useSettingsStore.getState().theme).toBe('dark');
    expect(useSettingsStore.getState().serverPort).toBe(9002);
    expect(useSettingsStore.getState().settingsLoaded).toBe(true);
  });

  it('initSettings uses defaults when nothing is persisted', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    await useSettingsStore.getState().initSettings();
    expect(useSettingsStore.getState().theme).toBe('system');
    expect(useSettingsStore.getState().serverPort).toBe(9001);
  });
});
```

**Step 2: Run test — verify it FAILS**

```bash
cd client && npm test -- --testPathPattern=settingsStore
```
Expected: FAIL with "Cannot find module '../settingsStore'"

**Step 3: Create settingsStorage service**

```typescript
// client/src/modules/settings/services/settingsStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../../utils/logger';

const STORAGE_KEY = '@nexus/settings';

export type AppTheme = 'light' | 'dark' | 'system';

export interface AppSettings {
  readonly theme: AppTheme;
  readonly serverPort: number;
}

const DEFAULTS: AppSettings = { theme: 'system', serverPort: 9001 };

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      theme: (['light', 'dark', 'system'] as const).includes(parsed.theme as AppTheme)
        ? (parsed.theme as AppTheme)
        : DEFAULTS.theme,
      serverPort:
        typeof parsed.serverPort === 'number' &&
        parsed.serverPort >= 1024 &&
        parsed.serverPort <= 65535
          ? parsed.serverPort
          : DEFAULTS.serverPort,
    };
  } catch {
    logger.error('settingsStorage', 'failed to load settings');
    return DEFAULTS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    logger.error('settingsStorage', 'failed to save settings');
  }
}
```

**Step 4: Create settingsStore**

```typescript
// client/src/stores/settingsStore.ts
import { create } from 'zustand';
import type { AppTheme } from '../modules/settings/services/settingsStorage';
import { loadSettings, saveSettings } from '../modules/settings/services/settingsStorage';

interface SettingsState {
  readonly theme: AppTheme;
  readonly serverPort: number;
  readonly settingsLoaded: boolean;
  initSettings: () => Promise<void>;
  setTheme: (theme: AppTheme) => void;
  setServerPort: (port: number) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'system',
  serverPort: 9001,
  settingsLoaded: false,

  initSettings: async () => {
    const s = await loadSettings();
    set({ theme: s.theme, serverPort: s.serverPort, settingsLoaded: true });
  },

  setTheme: (theme) => {
    set({ theme });
    void saveSettings({ theme, serverPort: get().serverPort });
  },

  setServerPort: (port) => {
    const clamped = Math.max(1024, Math.min(65535, port));
    set({ serverPort: clamped });
    void saveSettings({ theme: get().theme, serverPort: clamped });
  },
}));
```

**Step 5: Run test — verify it PASSES**

```bash
cd client && npm test -- --testPathPattern=settingsStore
```
Expected: 5 tests pass

**Step 6: Commit**

```bash
git add client/src/stores/settingsStore.ts \
        client/src/stores/__tests__/settingsStore.test.ts \
        client/src/modules/settings/services/settingsStorage.ts
git commit -m "feat(client): add settingsStore with theme and serverPort"
```

---

## Task 4: useSettings hook + SettingsScreen

**Files:**
- Create: `client/src/modules/settings/hooks/useSettings.ts`
- Create: `client/src/modules/settings/screens/SettingsScreen.tsx`
- Create: `client/src/modules/settings/index.ts`

**Step 1: Install @react-native-community/slider if not present**

```bash
cd client && npx expo install @react-native-community/slider
```

**Step 2: Create useSettings hook**

```typescript
// client/src/modules/settings/hooks/useSettings.ts
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useTouchpadStore } from '../../../stores/touchpadStore';
import { lightColors, darkColors } from '../../../theme/colors';
import type { ThemeColors } from '../../../theme/colors';

export function useSettings() {
  const { theme, serverPort, setTheme, setServerPort } = useSettingsStore();
  const { sensitivity, setSensitivity } = useTouchpadStore();
  return { theme, serverPort, sensitivity, setTheme, setServerPort, setSensitivity };
}

export function useThemeColors(): ThemeColors {
  const systemScheme = useColorScheme();
  const theme = useSettingsStore((s) => s.theme);
  const isDark =
    theme === 'dark' || (theme === 'system' && systemScheme === 'dark');
  return isDark ? darkColors : lightColors;
}
```

**Step 3: Create SettingsScreen**

```tsx
// client/src/modules/settings/screens/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView, StatusBar, View, Text, Pressable,
  TextInput, StyleSheet, ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSettings, useThemeColors } from '../hooks/useSettings';
import type { AppTheme } from '../services/settingsStorage';

interface SettingsScreenProps {
  readonly onClose: () => void;
}

export function SettingsScreen({ onClose }: SettingsScreenProps): React.JSX.Element {
  const c = useThemeColors();
  const { theme, serverPort, sensitivity, setTheme, setServerPort, setSensitivity } = useSettings();
  const [portInput, setPortInput] = useState(String(serverPort));
  const [portError, setPortError] = useState<string | null>(null);

  function handlePortBlur() {
    const n = parseInt(portInput, 10);
    if (isNaN(n) || n < 1024 || n > 65535) {
      setPortError('Port must be between 1024 and 65535');
      setPortInput(String(serverPort));
    } else {
      setPortError(null);
      setServerPort(n);
    }
  }

  const THEMES: { value: AppTheme; label: string }[] = [
    { value: 'light',  label: 'Light' },
    { value: 'dark',   label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.text }]}>Settings</Text>
        <Pressable onPress={onClose} style={styles.doneButton}>
          <Text style={{ color: c.primary, fontSize: 16, fontWeight: '600' }}>Done</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Touchpad */}
        <Text style={[styles.sectionHeader, { color: c.textSecondary }]}>TOUCHPAD</Text>
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: c.text }]}>Sensitivity</Text>
            <Text style={[styles.valueText, { color: c.textSecondary }]}>
              {sensitivity.toFixed(1)}x
            </Text>
          </View>
          <Slider
            style={styles.slider}
            value={sensitivity}
            minimumValue={0.3}
            maximumValue={3.0}
            step={0.1}
            onValueChange={setSensitivity}
            minimumTrackTintColor={c.primary}
            maximumTrackTintColor={c.border}
            thumbTintColor={c.primary}
          />
        </View>

        {/* Appearance */}
        <Text style={[styles.sectionHeader, { color: c.textSecondary }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          {THEMES.map(({ value, label }, idx) => (
            <Pressable
              key={value}
              style={[
                styles.row,
                idx < THEMES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
              ]}
              onPress={() => setTheme(value)}
            >
              <Text style={[styles.label, { color: c.text }]}>{label}</Text>
              {theme === value && (
                <Text style={{ color: c.primary, fontSize: 18 }}>✓</Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* Connection */}
        <Text style={[styles.sectionHeader, { color: c.textSecondary }]}>CONNECTION</Text>
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: c.text }]}>Default Server Port</Text>
            <TextInput
              value={portInput}
              onChangeText={setPortInput}
              onBlur={handlePortBlur}
              keyboardType="number-pad"
              style={[styles.portInput, { color: c.text, borderColor: c.border }]}
              maxLength={5}
            />
          </View>
          {portError !== null && (
            <Text style={[styles.portError, { color: c.destructive }]}>{portError}</Text>
          )}
        </View>

        {/* About */}
        <Text style={[styles.sectionHeader, { color: c.textSecondary }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: c.text }]}>Nexus</Text>
            <Text style={[styles.valueText, { color: c.textSecondary }]}>iOS Remote Control</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: '700' },
  doneButton: { paddingVertical: 4, paddingHorizontal: 8 },
  content: { padding: 16, gap: 8 },
  sectionHeader: {
    fontSize: 12, fontWeight: '600', letterSpacing: 0.5,
    textTransform: 'uppercase', marginTop: 12, marginBottom: 4, marginLeft: 4,
  },
  card: { borderRadius: 12, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  label: { fontSize: 16 },
  valueText: { fontSize: 16 },
  slider: { width: '100%', paddingHorizontal: 12, marginBottom: 8 },
  portInput: {
    fontSize: 16, textAlign: 'right', borderWidth: 1,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, minWidth: 70,
  },
  portError: { fontSize: 12, paddingHorizontal: 16, paddingBottom: 10 },
});
```

**Step 4: Create module index**

```typescript
// client/src/modules/settings/index.ts
export { SettingsScreen } from './screens/SettingsScreen';
```

**Step 5: Run all client tests**

```bash
cd client && npm test
```
Expected: all pass

**Step 6: Commit**

```bash
git add client/src/modules/settings/ client/src/theme/
git commit -m "feat(client): add SettingsScreen with theme, sensitivity, and port settings"
```

---

## Task 5: Wire Settings into App.tsx (gear + Modal + theme-aware tab bar)

**Files:**
- Modify: `client/App.tsx`

**Step 1: Rewrite App.tsx to add gear button, Modal, and theme-aware colors**

```tsx
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { ConnectionScreen } from './src/modules/connection/screens/ConnectionScreen';
import { TouchpadScreen } from './src/modules/touchpad';
import { KeyboardScreen } from './src/modules/keyboard';
import { MediaScreen } from './src/modules/media';
import { MacroScreen } from './src/modules/macro';
import { ClipboardScreen } from './src/modules/clipboard';
import { SettingsScreen } from './src/modules/settings';
import { useConnectionStore } from './src/stores/connectionStore';
import { useThemeColors } from './src/modules/settings/hooks/useSettings';

type ActiveTab = 'touchpad' | 'keyboard' | 'media' | 'macro' | 'clipboard';

const TAB_CONFIG: { id: ActiveTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'touchpad',  label: 'Touchpad',  icon: 'hand-right-outline' },
  { id: 'keyboard',  label: 'Keyboard',  icon: 'keypad-outline' },
  { id: 'media',     label: 'Media',     icon: 'musical-notes-outline' },
  { id: 'macro',     label: 'Macros',    icon: 'flash-outline' },
  { id: 'clipboard', label: 'Clipboard', icon: 'clipboard-outline' },
];

export default function App(): React.JSX.Element {
  const status = useConnectionStore((s) => s.status);
  const disconnect = useConnectionStore((s) => s.disconnect);
  const [activeTab, setActiveTab] = useState<ActiveTab>('touchpad');
  const [showSettings, setShowSettings] = useState(false);
  const c = useThemeColors();

  if (status !== 'connected') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ConnectionScreen />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.appContainer, { backgroundColor: c.background }]}>
        <View style={styles.screenContainer}>
          {activeTab === 'touchpad'  && <TouchpadScreen onDisconnect={disconnect} />}
          {activeTab === 'keyboard'  && <KeyboardScreen onDisconnect={disconnect} />}
          {activeTab === 'media'     && <MediaScreen onDisconnect={disconnect} />}
          {activeTab === 'macro'     && <MacroScreen onDisconnect={disconnect} />}
          {activeTab === 'clipboard' && <ClipboardScreen onDisconnect={disconnect} />}
        </View>

        <View style={[styles.tabBar, { backgroundColor: c.tabBarBg, borderTopColor: c.tabBarBorder }]}>
          {TAB_CONFIG.map(({ id, label, icon }) => (
            <Pressable
              key={id}
              style={[styles.tab, activeTab === id && { borderTopWidth: 2, borderTopColor: c.primary }]}
              onPress={() => setActiveTab(id)}
            >
              <Ionicons name={icon} size={22} color={activeTab === id ? c.primary : c.textSecondary} />
              <Text style={[styles.tabText, { color: activeTab === id ? c.primary : c.textSecondary }]}>
                {label}
              </Text>
            </Pressable>
          ))}
          <Pressable style={styles.tab} onPress={() => setShowSettings(true)}>
            <Ionicons name="settings-outline" size={22} color={c.textSecondary} />
            <Text style={[styles.tabText, { color: c.textSecondary }]}>Settings</Text>
          </Pressable>
        </View>
      </View>

      <Modal visible={showSettings} animationType="slide" presentationStyle="fullScreen">
        <SettingsScreen onClose={() => setShowSettings(false)} />
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1 },
  screenContainer: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabText: { fontSize: 9, fontWeight: '500' },
});
```

**Step 2: Run tests**

```bash
cd client && npm test
```
Expected: all pass

**Step 3: Commit**

```bash
git add client/App.tsx
git commit -m "feat(client): wire Settings modal and theme-aware tab bar into App"
```

---

## Task 6: pkg packaging setup (server)

**Files:**
- Modify: `server/package.json`
- Create: `server/scripts/build-exe.ps1`

**Step 1: Install pkg**

```bash
cd server && npm install --save-dev pkg
```

**Step 2: Add pkg config and build script to server/package.json**

Under `"scripts"`, add:
```json
"build:exe": "npm run build && npx pkg dist/index.js --config package.json --output nexus-server.exe"
```

Add a top-level `"pkg"` key:
```json
"pkg": {
  "targets": ["node18-win-x64"],
  "assets": [
    "node_modules/@nut-tree-fork/nut-js/**/*.node",
    "node_modules/@nut-tree-fork/nut-js/**/*.dll",
    "node_modules/@nut-tree-fork/nut-js/lib/**/*"
  ],
  "scripts": ["dist/**/*.js"]
}
```

**Step 3: Create PowerShell build script**

```powershell
# server/scripts/build-exe.ps1
Write-Host "[nexus] Building TypeScript..."
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed"; exit 1 }

Write-Host "[nexus] Packaging with pkg..."
npx pkg dist/index.js --config package.json --output nexus-server.exe
if ($LASTEXITCODE -ne 0) { Write-Error "pkg failed"; exit 1 }

Write-Host "[nexus] Done: nexus-server.exe"
```

**Step 4: Add nexus-server.exe to server/.gitignore**

Add line: `nexus-server.exe`

**Step 5: Run server tests (verify nothing broken)**

```bash
cd server && npm test
```
Expected: all pass

**Step 6: Test the build**

```bash
cd server && npm run build:exe
```
Expected: `nexus-server.exe` appears in `server/` directory.

If nut.js native modules fail at runtime, check `pkg` output for warnings about `.node` files and update the `assets` glob in `package.json` to match the actual paths.

**Step 7: Commit**

```bash
git add server/package.json server/scripts/build-exe.ps1 server/.gitignore
git commit -m "feat(server): add pkg packaging configuration and build-exe script"
```

---

## Task 7: node-systray + auto-start module (server)

**Files:**
- Modify: `server/package.json` (add node-systray dependency)
- Create: `server/assets/icon.ico` (binary asset — see Step 2)
- Create: `server/src/modules/tray.ts`
- Create: `server/src/__tests__/tray.test.ts`

**Step 1: Install node-systray**

```bash
cd server && npm install node-systray
```

**Step 2: Obtain a tray icon**

Place any 16x16 or 32x32 `.ico` file at `server/assets/icon.ico`. Quick option — copy from Windows system directory:

```powershell
New-Item -ItemType Directory -Force server/assets
Copy-Item "C:\Windows\System32\shell32.dll" "server/assets/shell32.dll"
# Or download any free .ico from the web and save as server/assets/icon.ico
```

For a minimal placeholder that works, create a 1x1 ICO using PowerShell:
```powershell
# Creates a valid minimal .ico file
[System.IO.File]::WriteAllBytes("server/assets/icon.ico",
  [Convert]::FromBase64String("AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACAAAAAgIAAgAAAAIAAgACAgAAAgICAAMDAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="))
```

**Step 3: Write the failing test**

Create `server/src/__tests__/tray.test.ts`:

```typescript
jest.mock('node-systray', () => ({
  default: jest.fn().mockImplementation(() => ({
    onClick: jest.fn(),
    kill: jest.fn(),
  })),
}));

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

import { execSync } from 'child_process';
import { TrayManager } from '../modules/tray';

describe('TrayManager', () => {
  beforeEach(() => jest.clearAllMocks());

  it('constructs without throwing', () => {
    expect(() => new TrayManager()).not.toThrow();
  });

  it('isAutoStartEnabled returns false when registry query throws', () => {
    (execSync as jest.Mock).mockImplementation(() => { throw new Error('not found'); });
    const tray = new TrayManager();
    expect(tray.isAutoStartEnabled()).toBe(false);
  });

  it('isAutoStartEnabled returns true when registry entry present', () => {
    (execSync as jest.Mock).mockReturnValueOnce(Buffer.from('Nexus    REG_SZ    C:\\nexus.exe'));
    const tray = new TrayManager();
    expect(tray.isAutoStartEnabled()).toBe(true);
  });

  it('enableAutoStart calls reg add command', () => {
    const tray = new TrayManager();
    tray.enableAutoStart('C:\\nexus.exe');
    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('reg add'),
      expect.objectContaining({ stdio: 'pipe' }),
    );
  });

  it('disableAutoStart calls reg delete command', () => {
    const tray = new TrayManager();
    tray.disableAutoStart();
    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('reg delete'),
      expect.objectContaining({ stdio: 'pipe' }),
    );
  });
});
```

**Step 4: Run test — verify FAIL**

```bash
cd server && npm test -- --testPathPattern=tray
```
Expected: FAIL with "Cannot find module '../modules/tray'"

**Step 5: Create tray.ts**

```typescript
// server/src/modules/tray.ts
import { execSync } from 'child_process';
import { join } from 'path';
import SysTray from 'node-systray';

const REG_KEY = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
const REG_NAME = 'Nexus';

export class TrayManager {
  private tray: SysTray | null = null;
  private _autoStartEnabled: boolean;

  constructor() {
    this._autoStartEnabled = this.isAutoStartEnabled();
  }

  isAutoStartEnabled(): boolean {
    try {
      const out = execSync(`reg query "${REG_KEY}" /v "${REG_NAME}"`, { stdio: 'pipe' });
      return out.toString().includes(REG_NAME);
    } catch {
      return false;
    }
  }

  enableAutoStart(exePath: string): void {
    try {
      execSync(
        `reg add "${REG_KEY}" /v "${REG_NAME}" /t REG_SZ /d "${exePath}" /f`,
        { stdio: 'pipe' },
      );
      this._autoStartEnabled = true;
    } catch (err) {
      console.warn('[tray] auto-start failed (may need admin):', (err as Error).message);
    }
  }

  disableAutoStart(): void {
    try {
      execSync(`reg delete "${REG_KEY}" /v "${REG_NAME}" /f`, { stdio: 'pipe' });
      this._autoStartEnabled = false;
    } catch (err) {
      console.warn('[tray] disable auto-start failed:', (err as Error).message);
    }
  }

  start(onQuit: () => void): void {
    const iconPath = join(__dirname, '..', '..', 'assets', 'icon.ico');
    try {
      this.tray = new SysTray({
        menu: {
          icon: iconPath,
          title: 'Nexus',
          tooltip: 'Nexus — Windows Remote Control',
          items: [
            { title: 'Nexus Server', tooltip: 'Waiting for clients', checked: false, enabled: false },
            SysTray.separator,
            {
              title: `Start on Boot: ${this._autoStartEnabled ? 'ON' : 'OFF'}`,
              tooltip: 'Toggle launch at Windows startup',
              checked: this._autoStartEnabled,
              enabled: true,
            },
            SysTray.separator,
            { title: 'Quit', tooltip: 'Stop the server', checked: false, enabled: true },
          ],
        },
        debug: false,
        copyDir: true,
      });

      this.tray.onClick((action) => {
        if (action.seq_id === 2) {
          if (this._autoStartEnabled) {
            this.disableAutoStart();
          } else {
            this.enableAutoStart(process.execPath);
          }
        } else if (action.seq_id === 4) {
          this.stop();
          onQuit();
        }
      });
    } catch (err) {
      console.warn('[tray] unavailable (non-Windows or missing icon):', (err as Error).message);
    }
  }

  updateClientCount(count: number): void {
    console.log(`[tray] clients connected: ${count}`);
  }

  stop(): void {
    this.tray?.kill();
    this.tray = null;
  }
}
```

**Step 6: Run test — verify PASS**

```bash
cd server && npm test -- --testPathPattern=tray
```
Expected: 5 tests pass

**Step 7: Run full server test suite**

```bash
cd server && npm test
```
Expected: all pass

**Step 8: Commit**

```bash
git add server/src/modules/tray.ts \
        server/src/__tests__/tray.test.ts \
        server/assets/icon.ico
git commit -m "feat(server): add TrayManager with node-systray and registry auto-start"
```

---

## Task 8: Wire tray into server/src/index.ts

**Files:**
- Modify: `server/src/index.ts`

**Step 1: Update index.ts to initialize tray**

```typescript
// server/src/index.ts
import 'dotenv/config';
import { createServer } from './server';
import { startDiscovery } from './discovery';
import { config } from './config';
import { TrayManager } from './modules/tray';

console.log('[nexus] starting Nexus server...');
console.log('[nexus] Port', config.port, '— make sure Windows Firewall allows it');

const wss = createServer();
startDiscovery();

const tray = new TrayManager();
tray.start(() => {
  console.log('[nexus] quit from tray');
  wss.close(() => process.exit(0));
});

let clientCount = 0;
wss.on('connection', () => {
  clientCount += 1;
  tray.updateClientCount(clientCount);
});
```

**Step 2: Run server tests**

```bash
cd server && npm test
```
Expected: all pass

**Step 3: Commit**

```bash
git add server/src/index.ts
git commit -m "feat(server): initialize system tray on server startup"
```

---

## Task 9: Full verification + E2E checklist

**Step 1: Run all server tests**

```bash
cd server && npm test
```
Expected: 0 failures

**Step 2: Run all client tests**

```bash
cd client && npm test
```
Expected: 0 failures

**Step 3: Build .exe**

```bash
cd server && npm run build:exe
```
Expected: `nexus-server.exe` in `server/`

**Step 4: Manual E2E checklist**

Work through each item. Fix bugs as discovered (commit each fix separately).

- [ ] `nexus-server.exe` starts without crashing
- [ ] Tray icon visible in Windows notification area
- [ ] Tray tooltip shows "Nexus — Windows Remote Control"
- [ ] "Start on Boot" toggles correctly (verify in `regedit` at `HKCU\...\Run`)
- [ ] "Quit" closes the server cleanly
- [ ] iOS (Expo Go) connects to `.exe` server
- [ ] Touchpad controls cursor on PC
- [ ] Keyboard types text on PC
- [ ] Media controls work
- [ ] Macros execute correctly
- [ ] Clipboard sync works in both directions
- [ ] Settings modal opens via gear icon
- [ ] Sensitivity slider changes touchpad feel immediately
- [ ] Theme toggle changes tab bar colors
- [ ] Port change is validated (invalid shows error, valid saves)
- [ ] Settings persist after killing and reopening Expo Go

**Step 5: Update CLAUDE.md phase status**

In `CLAUDE.md`, change:
```
6. Clipboard Sync (bi-directional text)
7. Integration, polish, Windows `.exe` packaging
```
to:
```
6. ✅ Clipboard Sync (bi-directional text)
7. ✅ Integration, polish, Windows `.exe` packaging
```

And update `Current phase:` line to:
```
Current phase: **Phase 7 complete — all phases done.**
```

**Step 6: Final commit**

```bash
git add CLAUDE.md
git commit -m "docs: mark Phase 7 and all phases complete"
```
