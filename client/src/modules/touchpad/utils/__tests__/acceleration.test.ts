import { applyAcceleration } from '../acceleration';

describe('applyAcceleration', () => {
  test('returns 0 for zero input', () => {
    expect(applyAcceleration(0, 1.0)).toBe(0);
  });

  test('positive input returns positive output', () => {
    expect(applyAcceleration(5, 1.0)).toBeGreaterThan(0);
  });

  test('negative input returns negative output', () => {
    expect(applyAcceleration(-5, 1.0)).toBeLessThan(0);
  });

  test('higher sensitivity increases output magnitude', () => {
    const low = Math.abs(applyAcceleration(5, 0.5));
    const high = Math.abs(applyAcceleration(5, 2.0));
    expect(high).toBeGreaterThan(low);
  });

  test('small deltas remain small (precision)', () => {
    expect(applyAcceleration(1, 1.0)).toBeCloseTo(1.0, 1);
  });

  test('large deltas are amplified (acceleration)', () => {
    expect(applyAcceleration(10, 1.0)).toBeGreaterThan(10);
  });
});
