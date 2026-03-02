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
