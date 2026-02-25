const isDev = __DEV__;

export const logger = {
  log: (tag: string, ...args: unknown[]) => {
    if (isDev) console.log(`[${tag}]`, ...args);
  },
  warn: (tag: string, ...args: unknown[]) => {
    if (isDev) console.warn(`[${tag}]`, ...args);
  },
  error: (tag: string, ...args: unknown[]) => {
    console.error(`[${tag}]`, ...args);
  },
};
