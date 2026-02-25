export const MODIFIER_KEYS = [
  { key: 'ctrl', label: 'Ctrl' },
  { key: 'alt', label: 'Alt' },
  { key: 'shift', label: 'Shift' },
  { key: 'win', label: 'Win' },
] as const;

export const FUNCTION_KEYS = [
  { key: 'f1', label: 'F1' },
  { key: 'f2', label: 'F2' },
  { key: 'f3', label: 'F3' },
  { key: 'f4', label: 'F4' },
  { key: 'f5', label: 'F5' },
  { key: 'f6', label: 'F6' },
  { key: 'f7', label: 'F7' },
  { key: 'f8', label: 'F8' },
  { key: 'f9', label: 'F9' },
  { key: 'f10', label: 'F10' },
  { key: 'f11', label: 'F11' },
  { key: 'f12', label: 'F12' },
] as const;

export const NAVIGATION_KEYS = [
  { key: 'escape', label: 'Esc' },
  { key: 'tab', label: 'Tab' },
  { key: 'backspace', label: '⌫' },
  { key: 'delete', label: 'Del' },
  { key: 'insert', label: 'Ins' },
  { key: 'home', label: 'Home' },
  { key: 'end', label: 'End' },
  { key: 'pageup', label: 'PgUp' },
  { key: 'pagedown', label: 'PgDn' },
  { key: 'up', label: '↑' },
  { key: 'down', label: '↓' },
  { key: 'left', label: '←' },
  { key: 'right', label: '→' },
] as const;

export const COMMON_SHORTCUTS = [
  { label: 'Copy', keys: ['ctrl', 'c'] as string[] },
  { label: 'Paste', keys: ['ctrl', 'v'] as string[] },
  { label: 'Cut', keys: ['ctrl', 'x'] as string[] },
  { label: 'Undo', keys: ['ctrl', 'z'] as string[] },
  { label: 'Redo', keys: ['ctrl', 'y'] as string[] },
  { label: 'Select All', keys: ['ctrl', 'a'] as string[] },
  { label: 'Alt+Tab', keys: ['alt', 'tab'] as string[] },
  { label: 'Alt+F4', keys: ['alt', 'f4'] as string[] },
  { label: 'Win+D', keys: ['win', 'd'] as string[] },
  { label: 'Task Mgr', keys: ['ctrl', 'shift', 'escape'] as string[] },
] as const;

export type ModifierKey = typeof MODIFIER_KEYS[number]['key'];
export type FunctionKey = typeof FUNCTION_KEYS[number]['key'];
export type NavigationKey = typeof NAVIGATION_KEYS[number]['key'];
