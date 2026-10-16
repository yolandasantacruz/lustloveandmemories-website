import { ShapeDefinition } from './shapes.data';
import { seeded } from '../common/math';

const MS = 4;

export function drawOps(g: CanvasRenderingContext2D, ops: (string | number)[][]): void {
  g.fillStyle = g.strokeStyle = '#000';
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (const op of ops) {
    const type = op.at(0);
    if (type === 'f') {
      g.fill(new Path2D(op.at(1) as string));
    } else if (type === 's') {
      g.lineWidth = op.at(2) as number;
      g.stroke(new Path2D(op.at(1) as string));
    } else if (type === 'c') {
      g.beginPath();
      g.arc(op.at(1) as number, op.at(2) as number, op.at(3) as number, 0, Math.PI * 2);
      g.fill();
    } else if (type === 'e') {
      g.beginPath();
      g.ellipse(
        op.at(1) as number,
        op.at(2) as number,
        op.at(3) as number,
        op.at(4) as number,
        op.at(5) as number,
        0,
        Math.PI * 2
      );
      g.fill();
    }
  }
}

function maskOf(shape: ShapeDefinition): { w: number; h: number; data: Uint8ClampedArray } {
  if (typeof document === 'undefined') {
    return { w: shape.w * MS, h: shape.h * MS, data: new Uint8ClampedArray(0) };
  }
  const c = document.createElement('canvas');
  c.width = shape.w * MS;
  c.height = shape.h * MS;
  const g = c.getContext('2d');
  if (!g) return { w: c.width, h: c.height, data: new Uint8ClampedArray(0) };
  g.scale(MS, MS);
  drawOps(g, shape.ops);
  return { w: c.width, h: c.height, data: g.getImageData(0, 0, c.width, c.height).data };
}

export interface PlacedGlyph {
  x: number;
  y: number;
  r: number;
  gx: number;
  gy: number;
  ch?: string;
  a?: number;
  it?: boolean;
}

export interface PackedShapeResult {
  placed: PlacedGlyph[];
  bbox: [number, number, number, number];
}

export function packShape(shape: ShapeDefinition, seed: number): PackedShapeResult {
  const m = maskOf(shape);
  const st = 2;
  const gw = Math.ceil(m.w / st);
  const gh = Math.ceil(m.h / st);
  const N = gw * gh;
  const d = new Float32Array(N);
  const BIG = 1e9;

  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const idx = (y * st * m.w + x * st) * 4 + 3;
      d[y * gw + x] = (m.data.at(idx) ?? 0) > 120 ? BIG : 0;
    }
  }

  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= gw || y >= gh ? 0 : (d.at(y * gw + x) ?? 0));

  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const i = y * gw + x;
      const curr = d.at(i) ?? 0;
      if (curr) {
        d[i] = Math.min(curr, at(x - 1, y) + 3, at(x, y - 1) + 3, at(x - 1, y - 1) + 4, at(x + 1, y - 1) + 4);
      }
    }
  }

  for (let y = gh - 1; y >= 0; y--) {
    for (let x = gw - 1; x >= 0; x--) {
      const i = y * gw + x;
      const curr = d.at(i) ?? 0;
      if (curr) {
        d[i] = Math.min(curr, at(x + 1, y) + 3, at(x, y + 1) + 3, at(x + 1, y + 1) + 4, at(x - 1, y + 1) + 4);
      }
    }
  }

  const rnd = seeded(seed);
  const cands: { x: number; y: number; dt: number; k: number; gx: number; gy: number }[] = [];
  let minx = 1e9;
  let miny = 1e9;
  let maxx = 0;
  let maxy = 0;

  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const v = d.at(y * gw + x) ?? 0;
      if (!v) continue;
      const px = x * st;
      const py = y * st;
      const dist = (v / 3) * st;
      minx = Math.min(minx, px);
      maxx = Math.max(maxx, px);
      miny = Math.min(miny, py);
      maxy = Math.max(maxy, py);
      cands.push({
        x: px,
        y: py,
        dt: dist,
        k: dist * (0.55 + rnd() * 0.9),
        gx: at(x + 1, y) - at(x - 1, y),
        gy: at(x, y + 1) - at(x, y - 1)
      });
    }
  }

  cands.sort((a, b) => b.k - a.k);
  const maxR = 40;
  const minR = 4.4;
  const placed: PlacedGlyph[] = [];

  for (const c of cands) {
    let r = Math.min(c.dt * 1.05, maxR);
    for (let i = 0; i < placed.length && r >= minR; i++) {
      const p = placed.at(i);
      if (!p) continue;
      const dd = Math.hypot(p.x - c.x, p.y - c.y) - p.r * 0.72;
      if (dd < r) r = dd;
    }
    if (r >= minR) {
      placed.push({ x: c.x, y: c.y, r, gx: c.gx, gy: c.gy });
    }
  }

  placed.sort((a, b) => b.r - a.r);
  const letters = shape.words.replace(/[^a-z]/gi, '');

  placed.forEach((p, i) => {
    const big = p.r > maxR * 0.5;
    const ch = letters.at((i * 7) % letters.length) ?? 'a';
    p.ch = big ? ch.toUpperCase() : rnd() < 0.12 ? ch.toUpperCase() : ch;
    if (p.r < maxR * 0.42) {
      p.a = Math.atan2(p.gy, p.gx) + Math.PI / 2 + (rnd() < 0.3 ? Math.PI : 0) + (rnd() - 0.5) * 0.3;
    } else {
      const q = rnd();
      p.a = (rnd() - 0.5) * 0.7 + (q < 0.14 ? Math.PI / 2 : q < 0.26 ? -Math.PI / 2 : q < 0.33 ? Math.PI : 0);
    }
    p.it = rnd() < 0.3;
  });

  return { placed, bbox: [minx, miny, maxx + st, maxy + st] };
}
