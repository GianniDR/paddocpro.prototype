/**
 * Mock clock — app code reads "now" from here, never `new Date()`.
 * Tests can freeze + advance; production uses real time (initialised in CSR).
 */
let nowMs = Date.parse("2026-04-25T09:00:00Z");
const listeners = new Set<() => void>();

export function now(): Date {
  return new Date(nowMs);
}

export function nowMillis(): number {
  return nowMs;
}

export function setNow(d: Date | string) {
  nowMs = typeof d === "string" ? Date.parse(d) : d.getTime();
  for (const l of listeners) l();
}

export function advanceBy(ms: number) {
  setNow(new Date(nowMs + ms));
}

export function onTick(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
