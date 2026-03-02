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
