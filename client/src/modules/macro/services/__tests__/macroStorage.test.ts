import { MacroDefinition } from '@nexus/shared';

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: mockGetItem,
    setItem: mockSetItem,
  },
}));

import { loadMacros, saveMacros } from '../macroStorage';

beforeEach(() => {
  mockGetItem.mockReset();
  mockSetItem.mockReset();
});

describe('macroStorage', () => {
  const sampleMacro: MacroDefinition = {
    macroId: 'test-1',
    name: 'Test',
    icon: 'copy',
    color: '#000',
    steps: [{ type: 'key_combo', keys: ['ctrl', 'c'], delay: 0 }],
    isPreset: false,
    order: 0,
  };

  describe('loadMacros', () => {
    test('returns preset shortcuts when storage is empty (first launch)', async () => {
      mockGetItem.mockResolvedValue(null);
      const macros = await loadMacros();
      expect(macros.length).toBeGreaterThan(0);
      expect(macros.every((m) => m.isPreset)).toBe(true);
      expect(mockSetItem).toHaveBeenCalledTimes(1);
    });

    test('returns saved macros from storage', async () => {
      mockGetItem.mockResolvedValue(JSON.stringify([sampleMacro]));
      const macros = await loadMacros();
      expect(macros).toEqual([sampleMacro]);
      expect(mockSetItem).not.toHaveBeenCalled();
    });

    test('returns a new array (immutable)', async () => {
      mockGetItem.mockResolvedValue(JSON.stringify([sampleMacro]));
      const a = await loadMacros();
      const b = await loadMacros();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe('saveMacros', () => {
    test('persists macros to AsyncStorage as JSON', async () => {
      await saveMacros([sampleMacro]);
      expect(mockSetItem).toHaveBeenCalledWith(
        '@nexus/macros',
        JSON.stringify([sampleMacro]),
      );
    });
  });
});
