// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createThrottle<T extends (...args: any[]) => void>(
  fn: T,
  intervalMs: number,
): (...args: Parameters<T>) => void {
  let lastCall = -Infinity;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= intervalMs) {
      lastCall = now;
      fn(...args);
    }
  };
}
