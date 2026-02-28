import { MacroDefinition } from '@nexus/shared';

export const PRESET_SHORTCUTS: readonly MacroDefinition[] = [
  {
    macroId: 'preset-copy', name: 'Copy', icon: 'copy', color: '#007AFF',
    steps: [{ type: 'key_combo', keys: ['ctrl', 'c'], delay: 0 }], isPreset: true, order: 0,
  },
  {
    macroId: 'preset-cut', name: 'Cut', icon: 'scissors', color: '#FF9500',
    steps: [{ type: 'key_combo', keys: ['ctrl', 'x'], delay: 0 }], isPreset: true, order: 1,
  },
  {
    macroId: 'preset-paste', name: 'Paste', icon: 'clipboard', color: '#34C759',
    steps: [{ type: 'key_combo', keys: ['ctrl', 'v'], delay: 0 }], isPreset: true, order: 2,
  },
  {
    macroId: 'preset-undo', name: 'Undo', icon: 'rotate-ccw', color: '#5856D6',
    steps: [{ type: 'key_combo', keys: ['ctrl', 'z'], delay: 0 }], isPreset: true, order: 3,
  },
  {
    macroId: 'preset-redo', name: 'Redo', icon: 'rotate-cw', color: '#AF52DE',
    steps: [{ type: 'key_combo', keys: ['ctrl', 'y'], delay: 0 }], isPreset: true, order: 4,
  },
  {
    macroId: 'preset-select-all', name: 'Select All', icon: 'check-square', color: '#FF2D55',
    steps: [{ type: 'key_combo', keys: ['ctrl', 'a'], delay: 0 }], isPreset: true, order: 5,
  },
  {
    macroId: 'preset-screenshot', name: 'Screenshot', icon: 'camera', color: '#FF3B30',
    steps: [{ type: 'key', key: 'printscreen', delay: 0 }], isPreset: true, order: 6,
  },
  {
    macroId: 'preset-lock', name: 'Lock Screen', icon: 'lock', color: '#8E8E93',
    steps: [{ type: 'key_combo', keys: ['win', 'l'], delay: 0 }], isPreset: true, order: 7,
  },
  {
    macroId: 'preset-task-manager', name: 'Task Manager', icon: 'activity', color: '#FF9500',
    steps: [{ type: 'key_combo', keys: ['ctrl', 'shift', 'escape'], delay: 0 }], isPreset: true, order: 8,
  },
  {
    macroId: 'preset-show-desktop', name: 'Show Desktop', icon: 'monitor', color: '#007AFF',
    steps: [{ type: 'key_combo', keys: ['win', 'd'], delay: 0 }], isPreset: true, order: 9,
  },
  {
    macroId: 'preset-file-explorer', name: 'File Explorer', icon: 'folder', color: '#FFCC00',
    steps: [{ type: 'key_combo', keys: ['win', 'e'], delay: 0 }], isPreset: true, order: 10,
  },
  {
    macroId: 'preset-task-view', name: 'Task View', icon: 'layers', color: '#5AC8FA',
    steps: [{ type: 'key_combo', keys: ['win', 'tab'], delay: 0 }], isPreset: true, order: 11,
  },
];
