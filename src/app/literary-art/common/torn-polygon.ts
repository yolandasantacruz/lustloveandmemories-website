import { seeded } from './math';

/**
 * Torn paper edge polygon generator for poetic editorial aesthetics.
 */
export function generateTornPolygon(seed: number, jag = 6, pts = 26): string {
  const rnd = seeded(seed);
  const t: string[] = [];
  const b: string[] = [];
  for (let i = 0; i <= pts; i++) {
    const x = (i / pts) * 100;
    t.push(`${x.toFixed(1)}% ${(rnd() * jag).toFixed(1)}%`);
    b.push(`${(100 - x).toFixed(1)}% ${(100 - rnd() * jag).toFixed(1)}%`);
  }
  return `polygon(${t.join(',')},${(100 - rnd()).toFixed(1)}% 50%,${b.join(',')},${rnd().toFixed(1)}% 50%)`;
}
