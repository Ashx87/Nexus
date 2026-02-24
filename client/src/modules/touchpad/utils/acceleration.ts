const EXPONENT = 1.2;

export function applyAcceleration(rawDelta: number, sensitivity: number): number {
  if (rawDelta === 0) return 0;
  const sign = rawDelta > 0 ? 1 : -1;
  const magnitude = Math.abs(rawDelta);
  return sign * sensitivity * Math.pow(magnitude, EXPONENT);
}
