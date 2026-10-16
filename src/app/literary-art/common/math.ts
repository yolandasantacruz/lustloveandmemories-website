export const clamp = (v: number, a = 0, b = 1): number => Math.min(b, Math.max(a, v));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const easeIO = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const seeded = (s: number): (() => number) => () => {
  s |= 0;
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const getDpr = (): number => {
  if (typeof window === 'undefined') return 1;
  return Math.min(window.devicePixelRatio || 1, 2);
};

export const NOOP = (): void => {
  // Cleanup no-op when canvas context or DOM environment is unavailable
};
