import { createThrottle } from '../throttle';

describe('createThrottle', () => {
  beforeEach(() => { jest.useFakeTimers(); });
  afterEach(() => { jest.useRealTimers(); });

  test('calls function immediately on first invocation', () => {
    const fn = jest.fn();
    const throttled = createThrottle(fn, 16);
    jest.setSystemTime(0);
    throttled(1, 2);
    expect(fn).toHaveBeenCalledWith(1, 2);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('blocks calls within interval', () => {
    const fn = jest.fn();
    const throttled = createThrottle(fn, 16);
    jest.setSystemTime(0);
    throttled(1, 2);
    jest.setSystemTime(10);
    throttled(3, 4);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('allows calls after interval has passed', () => {
    const fn = jest.fn();
    const throttled = createThrottle(fn, 16);
    jest.setSystemTime(0);
    throttled(1, 2);
    jest.setSystemTime(17);
    throttled(3, 4);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(3, 4);
  });
});
