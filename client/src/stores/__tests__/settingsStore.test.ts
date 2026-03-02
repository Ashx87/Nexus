const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: mockGetItem,
    setItem: mockSetItem,
  },
}));

import { useSettingsStore } from '../settingsStore';

beforeEach(() => {
  useSettingsStore.setState({
    theme: 'system',
    serverPort: 9001,
    settingsLoaded: false,
  });
  mockGetItem.mockReset();
  mockSetItem.mockReset();
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
    mockGetItem.mockResolvedValueOnce(JSON.stringify({ theme: 'dark', serverPort: 9002 }));
    await useSettingsStore.getState().initSettings();
    expect(useSettingsStore.getState().theme).toBe('dark');
    expect(useSettingsStore.getState().serverPort).toBe(9002);
    expect(useSettingsStore.getState().settingsLoaded).toBe(true);
  });

  it('initSettings uses defaults when nothing is persisted', async () => {
    mockGetItem.mockResolvedValueOnce(null);
    await useSettingsStore.getState().initSettings();
    expect(useSettingsStore.getState().theme).toBe('system');
    expect(useSettingsStore.getState().serverPort).toBe(9001);
  });
});
