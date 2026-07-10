const UNIT_TO_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
};

/** Parses durations like "15m", "7d", "1h" (as used by JWT_EXPIRES_IN-style env vars) into milliseconds. */
export function parseDurationMs(duration: string): number {
  const match = /^(\d+)(ms|s|m|h|d|w)$/.exec(duration.trim());

  if (!match) {
    const asNumber = Number(duration);
    if (!Number.isNaN(asNumber)) return asNumber * 1000;
    throw new Error(`Invalid duration string: ${duration}`);
  }

  const [, amount, unit] = match;
  return Number(amount) * UNIT_TO_MS[unit];
}
