// ═══════════════════════════════════════════════════════════════════════════════
// LITERARY ART ENGINES — Dark Romantic Interactive Canvas & Typographic Physics
// Adapted for Yolanda Santa Cruz: Lust, Love, and Memories
// ═══════════════════════════════════════════════════════════════════════════════

export interface ShapeDefinition {
  name: string;
  words: string;
  w: number;
  h: number;
  ops: (string | number)[][];
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const seeded = (s: number) => () => {
  s |= 0;
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const getDpr = () => Math.min(window.devicePixelRatio || 1, 2);

const NOOP = () => {
  // Cleanup no-op when canvas context is unavailable
};

// Torn paper edge polygon generator
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

// ─── LIVE LETTERS (ORGANIC MOUSE TILT ON HEADINGS) ───────────────────────────
export function setupLiveLetters(rootEl: HTMLElement, prefersReducedMotion: boolean): void {
  const liveEls = rootEl.querySelectorAll<HTMLElement>('.live');
  liveEls.forEach((el) => {
    // Avoid double-wrapping
    if (el.dataset['liveInit'] === 'true') return;
    el.dataset['liveInit'] = 'true';

    const walk = (n: Node) => {
      Array.from(n.childNodes).forEach((c) => {
        if (c.nodeType === 3 && c.textContent) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach((part: string) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.append(part);
              return;
            }
            const w = document.createElement('span');
            w.style.whiteSpace = 'nowrap';
            w.style.display = 'inline-block';
            Array.from(part).forEach((ch) => {
              const s = document.createElement('span');
              s.className = 'live-char';
              s.textContent = ch;
              s.style.display = 'inline-block';
              s.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
              s.style.willChange = 'transform';
              w.append(s);
            });
            frag.append(w);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1) {
          walk(c);
        }
      });
    };
    walk(el);

    if (prefersReducedMotion) return;

    const letters = Array.from(el.querySelectorAll<HTMLElement>('.live-char'));
    const host = el.closest('button') || el;
    let centers: [number, number, number][] = [];

    host.addEventListener('pointerenter', () => {
      centers = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2, r.height];
      });
    });

    host.addEventListener('pointermove', (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !centers.length) return;
      letters.forEach((l, i) => {
        const center = centers.at(i);
        if (!center) return;
        const [cx, cy, h] = center;
        const dx = cx - e.clientX;
        const dy = cy - e.clientY;
        const s = h * 1.6;
        const f = Math.exp(-(dx * dx + dy * dy * 0.5) / (s * s));
        if (f > 0.02) {
          l.style.transform = `translate(${(dx * 0.1 * f).toFixed(1)}px, ${(-h * 0.22 * f).toFixed(1)}px) rotate(${(
            (dx / s) *
            -9 *
            f
          ).toFixed(1)}deg)`;
        } else {
          l.style.transform = '';
        }
      });
    });

    host.addEventListener('pointerleave', () => {
      letters.forEach((l) => (l.style.transform = ''));
    });
  });
}

// ─── SHAPES DEFINITIONS (LITERARY CALLIGRAMS) ─────────────────────────────────
export const SHAPES: ShapeDefinition[] = [
  {
    name: 'a dancer',
    words: 'whenever i want to write you i write me',
    w: 100,
    h: 130,
    ops: [
      ['c', 54, 15, 6.6],
      ['c', 59.5, 10, 3.4],
      ['s', 'M52,21 L50,28', 4.6],
      ['f', 'M41,28 C47,26 56,26 61,28 L57,50 L45,51 Z'],
      ['f', 'M45,48 L58,47 C64,58 70,66 77,74 C66,79 52,81 44,80 C38,79 33,78 27,76 C34,66 40,57 45,48 Z'],
      ['s', 'M44,31 Q36,24 32,18 Q28,11 25,3', 4.2],
      ['s', 'M58,31 Q66,36 73,38 Q80,38 89,33', 4.2],
      ['s', 'M49,78 Q49,92 48.5,104 Q48,114 47,121', 5.8],
      ['s', 'M47,121 L54,124', 3.4],
      ['s', 'M57,76 Q66,86 72,92 Q79,96 89,97', 5.2]
    ]
  },
  {
    name: 'two lovers',
    words: 'softness is my soft spot',
    w: 100,
    h: 135,
    ops: [
      // Left figure (standing)
      ['c', 35, 16, 6.2],
      ['s', 'M35,22 L35,29', 4.4],
      ['f', 'M26,29 C32,27 38,27 44,29 L41,62 L29,62 Z'],
      ['s', 'M27,31 Q20,44 22,60', 4.0],
      ['s', 'M33,62 L32,124', 5.6],
      ['s', 'M39,62 L40,124', 5.4],
      // Right figure (leaning in embrace)
      ['c', 58, 20, 6.0],
      ['s', 'M56,26 L53,33', 4.2],
      ['f', 'M46,33 C53,30 62,31 66,35 L61,66 L49,66 Z'],
      ['s', 'M50,35 Q42,48 40,62', 4.2],
      ['s', 'M64,35 Q71,46 66,62', 3.8],
      ['s', 'M52,66 L50,124', 5.4],
      ['s', 'M59,66 L62,124', 5.2]
    ]
  },
  {
    name: 'a flower',
    words: 'some flowers get killed before they get their chance to flourish',
    w: 100,
    h: 125,
    ops: [
      ['c', 50, 32, 8.5],
      ['f', 'M50,23 C42,12 58,12 50,23 Z'],
      ['f', 'M50,41 C42,52 58,52 50,41 Z'],
      ['f', 'M41,32 C30,24 30,40 41,32 Z'],
      ['f', 'M59,32 C70,24 70,40 59,32 Z'],
      ['f', 'M43,26 C33,18 40,10 48,22 Z'],
      ['f', 'M57,26 C67,18 60,10 52,22 Z'],
      ['s', 'M50,41 Q51,75 50,118', 4.8],
      ['f', 'M50,68 C38,58 35,74 49,75 Z'],
      ['f', 'M50,88 C62,78 65,94 51,95 Z']
    ]
  },
  {
    name: 'a profile in wire',
    words: 'we already lost each other many weeks ago i am getting back my peace',
    w: 100,
    h: 120,
    ops: [
      ['c', 50, 28, 14],
      ['f', 'M42,24 C45,36 55,42 64,48 C58,54 52,58 46,68 L36,54 Z'],
      ['s', 'M46,68 Q44,82 46,96', 5],
      ['s', 'M38,42 Q30,58 32,84', 4.2],
      ['s', 'M58,52 Q70,68 62,94', 4.5],
      ['s', 'M46,96 L58,114', 6],
      ['s', 'M38,90 L34,114', 5]
    ]
  },
  {
    name: 'a bird in flight',
    words: 'i wear a sleep mask to bed praying it is already morning',
    w: 100,
    h: 80,
    ops: [
      ['e', 50, 60, 16, 6, -0.08],
      ['c', 66, 56, 5],
      ['f', 'M69,55 L79,57.5 L69,59 Z'],
      ['f', 'M47,58 Q36,42 22,44 Q10,45 2,38 Q12,58 32,63 Z'],
      ['f', 'M53,56 Q62,38 79,30 Q90,26 99,19 Q88,42 66,57 Z'],
      ['f', 'M36,57 L24,61 L26,66 L38,63 Z']
    ]
  }
];

export const WALKER = {
  w: 100,
  h: 160,
  ops: [
    ['c', 50, 14, 8],
    ['c', 57, 7, 4],
    ['s', 'M48,22 L47,29', 5.5],
    ['f', 'M36,28 L60,28 L66,60 L73,99 L29,101 L34,60 Z'],
    ['s', 'M62,32 L70,58 L72,80', 6],
    ['f', 'M63,80 L89,80 L89,104 L63,104 Z'],
    ['s', 'M70,80 Q76,74 82,80', 2],
    ['s', 'M38,32 L30,56 L26,74', 6],
    ['s', 'M56,98 L64,128 L70,151', 7.5],
    ['s', 'M70,152 L79,154', 4],
    ['s', 'M42,98 L36,126 L26,148', 7.5],
    ['s', 'M26,149 L19,153', 4]
  ]
};

const MS = 4;
function drawOps(g: CanvasRenderingContext2D, ops: (string | number)[][]) {
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

function maskOf(shape: ShapeDefinition) {
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

export function packShape(shape: ShapeDefinition, seed: number) {
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
      if (d[i]) {
        d[i] = Math.min(d[i], at(x - 1, y) + 3, at(x, y - 1) + 3, at(x - 1, y - 1) + 4, at(x + 1, y - 1) + 4);
      }
    }
  }

  for (let y = gh - 1; y >= 0; y--) {
    for (let x = gw - 1; x >= 0; x--) {
      const i = y * gw + x;
      if (d[i]) {
        d[i] = Math.min(d[i], at(x + 1, y) + 3, at(x, y + 1) + 3, at(x + 1, y + 1) + 4, at(x - 1, y + 1) + 4);
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

// ─── 0. HERO OCEAN WAVE OF LETTERS (PERSPECTIVE & INTERACTIVE RIPPLES) ────────
export function initLetterSea(
  cv: HTMLCanvasElement,
  prefersReducedMotion: boolean,
  color = '#5c564d'
): () => void {
  const ctx = cv.getContext('2d');
  if (!ctx) return NOOP;

  const POETIC_CORPUS =
    'Whenever I want to write you, I write me. ' +
    'I will always make time for emotions, and that’s how this book came to be. ' +
    'Some memories stay with you like shattered pieces of a broken glass, making you bleed every time you stumble upon them. ' +
    'Some flowers get killed before they get their chance to flourish. ' +
    'Softness is my soft spot. We were creating art. ' +
    'I wear a sleep mask to bed. Every time I lift it up I pray that it is already morning. ' +
    'We already lost each other many weeks ago. I am getting back my peace. ' +
    'I started to write things about us without the expectation of sharing them. ' +
    'Five stages of grief: Denial, Anger, Bargaining, Depression, Acceptance. ';

  interface WaveChar {
    ch: string;
    colIndex: number;
    baseX: number;
    baseY: number;
    fontSize: number;
    opacity: number;
    italic: boolean;
  }

  interface WaveRow {
    docY: number;
    depth: number;
    fontSize: number;
    opacity: number;
    phase: number;
    speed: number;
    chars: WaveChar[];
  }

  interface Ripple {
    x: number;
    y: number;
    born: number;
    speed: number;
    maxRadius: number;
    amp: number;
  }

  let W = 0;
  let H = 0;
  let dpr = 1;
  let rows: WaveRow[] = [];
  const ripples: Ripple[] = [];
  let running = false;
  let animId = 0;

  const ptr = { x: -1e4, y: -1e4, px: -1e4, py: -1e4, speed: 0, active: false };

  function getDocHeight(): number {
    if (typeof document === 'undefined') return 3000;
    return Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight || 0,
      window.innerHeight * 2
    );
  }

  function buildOcean() {
    rows = [];
    const docH = getDocHeight();
    const rowStep = 36;
    const numRows = Math.ceil(docH / rowStep);
    const rnd = seeded(77);

    let corpusIdx = 0;
    for (let r = 0; r < numRows; r++) {
      const docY = r * rowStep + 24;
      const depth = (r % 24) / 23;
      const charStep = 15;
      const cols = Math.ceil((W + 160) / charStep);
      const startX = -80;

      const chars: WaveChar[] = [];
      for (let c = 0; c < cols; c++) {
        const ch = POETIC_CORPUS.at(corpusIdx % POETIC_CORPUS.length) ?? ' ';
        corpusIdx++;
        chars.push({
          ch,
          colIndex: c,
          baseX: startX + c * charStep,
          baseY: docY,
          fontSize: 14,
          opacity: lerp(0.045, 0.085, depth),
          italic: (c + r) % 5 === 0 || c % 7 === 0
        });
      }

      rows.push({
        docY,
        depth,
        fontSize: 14,
        opacity: lerp(0.045, 0.085, depth),
        phase: r * 0.45 + rnd() * 0.2,
        speed: lerp(0.2, 0.45, depth),
        chars
      });
    }
  }

  let cachedRects: DOMRect[] = [];
  function updateRects() {
    if (typeof document === 'undefined') return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.hero-lead, .book-feature__content, .book-feature__cover, .author-grid, .shapes-copy, .shapes-canvas-col, .reveal-wrap, .sheet, .walk-canvas, .center-head, .site-header, .site-footer'
      )
    );
    cachedRects = els.map((el) => el.getBoundingClientRect());
  }

  function size() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = getDpr();
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    buildOcean();
    updateRects();
    draw(performance.now());
  }

  function draw(now: number) {
    if (!ctx) return;
    const time = prefersReducedMotion ? 0 : now / 1000;
    const scrollY = typeof window !== 'undefined' ? (window.scrollY || window.pageYOffset || 0) : 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples.at(i);
      if (!rp) continue;
      const age = (now - rp.born) / 1000;
      if (age * rp.speed > rp.maxRadius) {
        ripples.splice(i, 1);
      }
    }

    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const row of rows) {
      const screenRowY = row.docY - scrollY;
      if (screenRowY < -60 || screenRowY > H + 60) {
        continue;
      }

      const d = row.depth;
      const restAmp = lerp(0.4, 1.1, d);
      const waveFreq = lerp(0.002, 0.001, d);
      const interactRadius = lerp(120, 220, d);

      for (const ch of row.chars) {
        let x = ch.baseX;
        let y = screenRowY;

        if (!prefersReducedMotion) {
          y += Math.sin(x * waveFreq + time * row.speed + row.phase) * restAmp;
        }

        // Proximity to content transparency — fades out close to text and vanishes underneath
        let contentFade = 1;
        const feather = 80;

        for (let k = 0; k < cachedRects.length; k++) {
          const rect = cachedRects.at(k);
          if (!rect) continue;
          if (
            x >= rect.left - feather &&
            x <= rect.right + feather &&
            y >= rect.top - feather &&
            y <= rect.bottom + feather
          ) {
            const dx = Math.max(0, Math.max(rect.left - x, x - rect.right));
            const dy = Math.max(0, Math.max(rect.top - y, y - rect.bottom));
            const dist = Math.hypot(dx, dy);
            const f = dist / feather;
            if (f < contentFade) {
              contentFade = f;
              if (contentFade === 0) break;
            }
          }
        }

        if (contentFade <= 0.03) continue;

        // Wave font size oscillation between 9.5px and 18px (continuous relative to document space)
        const sizePhase = Math.sin(x * 0.0026 + row.docY * 0.003 + time * 0.45 + row.phase);
        const currentSize = Math.round(lerp(9.5, 18, (sizePhase + 1) / 2));

        let extraOpacity = 0;

        if (ptr.active && !prefersReducedMotion) {
          const dx = x - ptr.x;
          const dy = y - ptr.y;
          const dist = Math.hypot(dx, dy);

          if (dist < interactRadius && dist > 0.1) {
            const force = Math.cos((dist / interactRadius) * (Math.PI / 2));
            const ripplePhase = dist * 0.035 - time * 3.5;
            const lift = Math.sin(ripplePhase) * force * 7 * Math.min(1.0, ptr.speed / 12 + 0.25);
            y += lift;
            x += (dx / dist) * force * 1.5;
            extraOpacity += force * 0.07;
          }
        }

        if (ripples.length > 0 && !prefersReducedMotion) {
          for (const rp of ripples) {
            const age = (now - rp.born) / 1000;
            const currentRadius = age * rp.speed;
            const dist = Math.hypot(x - rp.x, y - rp.y);
            const ringDist = Math.abs(dist - currentRadius);
            const ringWidth = 85;

            if (ringDist < ringWidth) {
              const decay = Math.max(0, 1 - currentRadius / rp.maxRadius);
              const ringForce = Math.cos((ringDist / ringWidth) * (Math.PI / 2)) * decay;
              const ringLift = Math.sin(ringDist * 0.06 - age * 6) * rp.amp * ringForce * 0.3;
              y += ringLift;
              extraOpacity += ringForce * 0.08;
            }
          }
        }

        const alpha = Math.min(0.20, (ch.opacity + extraOpacity) * contentFade);
        if (alpha < 0.008) continue;

        ctx.globalAlpha = alpha;
        ctx.font = `${ch.italic ? 'italic ' : ''}${currentSize}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;
        ctx.fillText(ch.ch, x, y);
      }
    }
  }

  function frame(now: number) {
    draw(now);
    animId = requestAnimationFrame(frame);
  }

  let lastTime = performance.now();
  const onPointerMove = (e: MouseEvent) => {
    const curX = e.clientX;
    const curY = e.clientY;
    const now = performance.now();
    const dt = Math.max(1, now - lastTime);
    lastTime = now;

    if (ptr.px > -1e3) {
      const dist = Math.hypot(curX - ptr.px, curY - ptr.py);
      ptr.speed = lerp(ptr.speed, (dist / dt) * 16, 0.25);
    }

    ptr.px = ptr.x;
    ptr.py = ptr.y;
    ptr.x = curX;
    ptr.y = curY;
    ptr.active = true;

    if (!running && !prefersReducedMotion) {
      running = true;
      animId = requestAnimationFrame(frame);
    }
  };

  const onPointerLeave = () => {
    ptr.active = false;
    ptr.px = ptr.py = -1e4;
    ptr.speed = 0;
  };

  const onClick = (e: MouseEvent) => {
    if (prefersReducedMotion) return;
    ripples.push({
      x: e.clientX,
      y: e.clientY,
      born: performance.now(),
      speed: 260,
      maxRadius: Math.max(W, H) * 0.85,
      amp: 7
    });
    if (!running) {
      running = true;
      animId = requestAnimationFrame(frame);
    }
  };

  let scrollTicking = false;
  const onScroll = () => {
    updateRects();
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(() => {
        scrollTicking = false;
        const currentDocH = getDocHeight();
        const lastRow = rows.at(-1);
        if (lastRow && currentDocH > lastRow.docY + 120) {
          buildOcean();
        }
      });
    }
    if (!running && !prefersReducedMotion) {
      running = true;
      animId = requestAnimationFrame(frame);
    }
  };

  let ro: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined' && typeof document !== 'undefined') {
    ro = new ResizeObserver(() => {
      const currentDocH = getDocHeight();
      const lastRow = rows.at(-1);
      if (!lastRow || Math.abs(currentDocH - lastRow.docY) > 100) {
        buildOcean();
      }
      updateRects();
    });
    if (document.body) {
      ro.observe(document.body);
    }
  }

  window.addEventListener('pointermove', onPointerMove as EventListener, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('click', onClick as EventListener, { passive: true });
  window.addEventListener('resize', size, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  size();
  if (!prefersReducedMotion) {
    running = true;
    animId = requestAnimationFrame(frame);
  }

  return () => {
    cancelAnimationFrame(animId);
    if (ro) ro.disconnect();
    window.removeEventListener('pointermove', onPointerMove as EventListener);
    window.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('click', onClick as EventListener);
    window.removeEventListener('resize', size);
    window.removeEventListener('scroll', onScroll);
  };
}

// ─── 1. HERO TYPOGRAPHIC MORPHING FIGURE CANVAS ──────────────────────────────
export function initHeroFigure(
  cv: HTMLCanvasElement,
  btn: HTMLElement,
  cap: HTMLElement,
  heroEl: HTMLElement,
  prefersReducedMotion: boolean,
  color = '#141312'
): () => void {
  const ctx = cv.getContext('2d');
  if (!ctx) return NOOP;

  interface HeroTarget {
    x: number;
    y: number;
    size: number;
    a: number;
    ch: string;
    it: boolean;
    al: number;
  }

  interface HeroGlyph {
    ox: number;
    oy: number;
    vx: number;
    vy: number;
    depth: number;
    spin: number;
    ph: number;
    delay: number;
    bend?: number;
    turn?: number;
    from: HeroTarget;
    to: HeroTarget;
  }

  const packs: ReturnType<typeof packShape>[] = [];
  let W = 0;
  let H = 0;
  let dpr = 1;
  const glyphs: HeroGlyph[] = [];
  let cur = 0;
  let morphStart = -1;
  let on = true;
  let running = false;
  let lastTap = 0;
  let exitP = 0;
  let animId = 0;

  const ptr = { x: -1e4, y: -1e4, on: false };

  function getPack(i: number) {
    if (!packs.at(i)) {
      packs[i] = packShape(SHAPES.at(i) ?? SHAPES[0], 101 + i * 17);
    }
    return packs.at(i)!;
  }

  function fit(pack: ReturnType<typeof packShape>) {
    const [x0, y0, x1, y1] = pack.bbox;
    const bw = x1 - x0;
    const bh = y1 - y0;
    const boxW = W * 0.82;
    const boxH = H * 0.82;
    const s = Math.min(boxW / bw, boxH / bh);
    return { s, ox: (W - bw * s) / 2 - x0 * s, oy: (H - bh * s) / 2 - y0 * s };
  }

  function target(pi: number, i: number) {
    const pk = getPack(pi);
    const f = fit(pk);
    const p = pk.placed.at(i);
    if (!p) {
      const q = pk.placed.at(i % pk.placed.length) ?? pk.placed[0];
      return {
        x: q.x * f.s + f.ox,
        y: q.y * f.s + f.oy,
        size: 0,
        a: q.a,
        ch: q.ch,
        it: q.it,
        al: 0
      };
    }
    return {
      x: p.x * f.s + f.ox,
      y: p.y * f.s + f.oy,
      size: p.r * f.s * 3.25,
      a: p.a,
      ch: p.ch,
      it: p.it,
      al: 1
    };
  }

  function setup() {
    const r = cv.getBoundingClientRect();
    W = r.width;
    H = r.height;
    dpr = getDpr();
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);

    const pk = getPack(cur);
    const n = Math.max(glyphs.length, pk.placed.length);
    const rnd = seeded(5);
    for (let i = 0; i < n; i++) {
      const t = target(cur, i);
      const existing = glyphs.at(i);
      if (!existing) {
        glyphs[i] = {
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
          depth: rnd(),
          spin: (rnd() - 0.5) * 3,
          ph: rnd() * 6.28,
          delay: 0,
          from: t,
          to: t
        };
      } else {
        existing.from = t;
        existing.to = t;
      }
    }
    cap.textContent = SHAPES.at(cur)?.words ?? '';
    btn.setAttribute(
      'aria-label',
      `A figure made of letters, now ${SHAPES.at(cur)?.name}. Rearrange the letters into a new figure.`
    );
    draw(performance.now());
  }

  const DUR = 1.5;
  function state(g: HeroGlyph, now: number): HeroTarget {
    if (morphStart < 0 || prefersReducedMotion) return g.to;
    const t = clamp(((now - morphStart) / 1000 - g.delay) / DUR);
    if (t >= 1) return g.to;
    const e = easeIO(t);
    const f = g.from;
    const to = g.to;
    const bend = g.bend ?? 0;
    const mx = (f.x + to.x) / 2 - (to.y - f.y) * bend;
    const my = (f.y + to.y) / 2 + (to.x - f.x) * bend;
    const x = (1 - e) * (1 - e) * f.x + 2 * (1 - e) * e * mx + e * e * to.x;
    const y = (1 - e) * (1 - e) * f.y + 2 * (1 - e) * e * my + e * e * to.y;
    return {
      x,
      y,
      size: lerp(f.size, to.size, e) * (1 - 0.45 * Math.sin(Math.PI * t)),
      a: lerp(f.a, to.a + (g.turn ?? 0), e),
      ch: t < 0.5 ? f.ch : to.ch,
      it: t < 0.5 ? f.it : to.it,
      al: lerp(f.al, to.al, e)
    };
  }

  function draw(now: number) {
    if (!ctx) return false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tt = now / 1000;
    const R = 70;
    const R2 = R * R;
    const ex = exitP * exitP;
    let busy = false;

    for (let i = 0; i < glyphs.length; i++) {
      const g = glyphs.at(i);
      if (!g) continue;
      const s = state(g, now);
      if (s !== g.to) busy = true;
      if (s.al <= 0.01 || s.size < 0.5) continue;
      let x = s.x;
      let y = s.y;
      let a = s.a;

      if (!prefersReducedMotion) {
        a += Math.sin(tt * 0.6 + g.ph) * 0.025;
        if (ptr.on) {
          const dx = x + g.ox - ptr.x;
          const dy = y + g.oy - ptr.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) * 1.3;
            g.vx += (dx / d) * f;
            g.vy += (dy / d) * f;
          }
        }
        g.vx = (g.vx - g.ox * 0.06) * 0.84;
        g.vy = (g.vy - g.oy * 0.06) * 0.84;
        g.ox += g.vx;
        g.oy += g.vy;
        x += g.ox;
        y += g.oy;
        a += g.ox * 0.02;
        if (ex > 0) {
          y += ex * H * (0.2 + g.depth * 0.7);
          a += exitP * g.spin;
        }
      }

      ctx.globalAlpha = s.al * (1 - ex * 0.7);
      const co = Math.cos(a) * dpr;
      const si = Math.sin(a) * dpr;
      ctx.setTransform(co, si, -si, co, x * dpr, y * dpr);
      ctx.font = `${s.it ? 'italic ' : ''}300 ${s.size.toFixed(1)}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;
      ctx.fillText(s.ch, 0, 0);
    }
    ctx.globalAlpha = 1;
    return busy;
  }

  function morph() {
    const now = performance.now();
    if (now - lastTap < 500) return;
    lastTap = now;

    const next = (cur + 1) % SHAPES.length;
    const pk = getPack(next);
    const n = Math.max(glyphs.length, pk.placed.length);
    const rnd = seeded(now | 0);

    for (let i = 0; i < n; i++) {
      const g =
        glyphs.at(i) ||
        (glyphs[i] = {
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
          depth: rnd(),
          spin: (rnd() - 0.5) * 3,
          ph: rnd() * 6.28,
          delay: 0,
          from: target(cur, i),
          to: target(cur, i)
        });
      g.from = state(g, now);
      g.to = target(next, i);
      g.delay = (i / n) * 0.32 + rnd() * 0.28;
      g.bend = (rnd() - 0.5) * 0.8;
      g.turn = rnd() < 0.3 ? (rnd() < 0.5 ? -1 : 1) * Math.PI * 2 : 0;
    }
    cur = next;
    morphStart = now;

    cap.classList.add('fade');
    setTimeout(() => {
      cap.textContent = SHAPES.at(cur)?.words ?? '';
      cap.classList.remove('fade');
    }, prefersReducedMotion ? 0 : 600);

    btn.setAttribute(
      'aria-label',
      `A figure made of letters, now ${SHAPES.at(cur)?.name}. Rearrange the letters into a new figure.`
    );
    if (prefersReducedMotion) {
      draw(now);
    } else {
      start();
    }
  }

  let idleAt = performance.now();
  function frame(now: number) {
    if (!on) {
      running = false;
      return;
    }
    const busy = draw(now);
    if (busy) idleAt = now;
    if (!prefersReducedMotion && now - idleAt > 9000 && !ptr.on && exitP < 0.05) {
      idleAt = now;
      morph();
    }
    animId = requestAnimationFrame(frame);
  }

  function start() {
    if (!running && on && !prefersReducedMotion) {
      running = true;
      animId = requestAnimationFrame(frame);
    }
  }

  btn.addEventListener('click', morph);
  const setP = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect();
    ptr.x = e.clientX - r.left;
    ptr.y = e.clientY - r.top;
    ptr.on = true;
    idleAt = performance.now();
  };
  btn.addEventListener('pointermove', setP);
  btn.addEventListener('pointerdown', setP);
  btn.addEventListener('pointerleave', () => (ptr.on = false));
  btn.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'mouse') setTimeout(() => (ptr.on = false), 300);
  });

  const onScroll = () => {
    exitP = 0;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  const observer = new IntersectionObserver(
    (es) => {
      const isVisible = es.at(0)?.isIntersecting ?? false;
      on = isVisible;
      if (isVisible) start();
    },
    { rootMargin: '120px' }
  );
  observer.observe(heroEl);

  let rt: ReturnType<typeof setTimeout> | undefined;
  const onResize = () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      setup();
    }, 180);
  };
  window.addEventListener('resize', onResize);

  setup();

  return () => {
    cancelAnimationFrame(animId);
    observer.disconnect();
    btn.removeEventListener('click', morph);
    heroEl.removeEventListener('pointermove', setP);
    heroEl.removeEventListener('pointerdown', setP);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  };
}

// ─── 2. LIKENESS IN THREAD / CONTINUOUS WIRE ART FACE CANVAS ──────────────────
export function initThreadPortrait(
  cv: HTMLCanvasElement,
  prefersReducedMotion: boolean,
  threadColor = '#141312'
): () => void {
  const ctx = cv.getContext('2d');
  if (!ctx) return NOOP;

  interface ThreadStroke {
    pts: [number, number][];
    type: 'feature' | 'hair' | 'scribble';
    weight: number;
  }

  // Artistic, delicate ink-scribble wire paths tailored to Yolanda's portrait (media_1791932094888.jpg)
  const STROKES: ThreadStroke[] = [
    // ── 1. DELICATE FACIAL FEATURES (HIGH FIDELITY & WARMTH) ──
    // Soft, natural arched eyebrows
    { pts: [[144, 174], [158, 166], [172, 165], [186, 170]], type: 'feature', weight: 1.4 },
    { pts: [[214, 170], [228, 165], [242, 166], [256, 174]], type: 'feature', weight: 1.4 },

    // Left almond eye (graceful upper lid, soft pupil crescent, subtle lid crease)
    { pts: [[148, 196], [158, 190], [168, 189], [178, 193], [183, 198]], type: 'feature', weight: 1.5 },
    { pts: [[153, 185], [165, 182], [176, 185]], type: 'feature', weight: 0.8 },
    { pts: [[163, 191], [167, 196], [171, 192]], type: 'feature', weight: 1.4 },
    { pts: [[152, 198], [166, 201], [179, 198]], type: 'feature', weight: 0.8 },

    // Right almond eye
    { pts: [[217, 198], [222, 193], [232, 189], [242, 190], [252, 196]], type: 'feature', weight: 1.5 },
    { pts: [[224, 185], [235, 182], [247, 185]], type: 'feature', weight: 0.8 },
    { pts: [[229, 192], [233, 196], [237, 191]], type: 'feature', weight: 1.4 },
    { pts: [[221, 198], [234, 201], [248, 198]], type: 'feature', weight: 0.8 },

    // Straight, slender nose & delicate soft tip
    { pts: [[188, 175], [191, 208], [193, 238]], type: 'feature', weight: 1.1 },
    { pts: [[192, 245], [200, 248], [208, 245]], type: 'feature', weight: 1.2 },
    { pts: [[184, 242], [188, 245]], type: 'feature', weight: 0.8 },
    { pts: [[212, 245], [216, 242]], type: 'feature', weight: 0.8 },
    { pts: [[198, 252], [200, 262], [202, 252]], type: 'feature', weight: 0.7 },

    // Soft, smiling lips (warm closed smile, slightly upturned corners)
    { pts: [[172, 277], [188, 272], [200, 274], [212, 272], [228, 277]], type: 'feature', weight: 1.3 },
    { pts: [[168, 276], [186, 280], [200, 281], [214, 280], [232, 276]], type: 'feature', weight: 1.6 },
    { pts: [[178, 283], [190, 292], [200, 294], [210, 292], [222, 283]], type: 'feature', weight: 1.3 },
    { pts: [[194, 299], [200, 301], [206, 299]], type: 'feature', weight: 0.8 },

    // Soft feminine jawline to rounded chin (youthful oval proportions)
    { pts: [[138, 220], [142, 258], [154, 296], [175, 324], [200, 332]], type: 'feature', weight: 1.5 },
    { pts: [[262, 220], [258, 258], [246, 296], [225, 324], [200, 332]], type: 'feature', weight: 1.5 },

    // Neck & cardigan collar
    { pts: [[168, 336], [165, 400]], type: 'feature', weight: 1.2 },
    { pts: [[232, 336], [235, 400]], type: 'feature', weight: 1.2 },
    { pts: [[165, 400], [200, 436], [235, 400]], type: 'feature', weight: 1.3 },

    // ── 2. VOLUMINOUS WAVY DARK HAIR (SWEEPING CROWN & CASCADING LOCKS) ──
    { pts: [[160, 85], [182, 58], [215, 50], [250, 52], [280, 68], [305, 96]], type: 'hair', weight: 2.2 },
    { pts: [[175, 58], [210, 52], [245, 56], [275, 75]], type: 'hair', weight: 1.7 },

    // Left cascading waves
    { pts: [[152, 72], [122, 105], [98, 150], [86, 205], [84, 268], [94, 332], [116, 395], [148, 445]], type: 'hair', weight: 2.4 },
    { pts: [[125, 115], [96, 168], [80, 230], [82, 298], [98, 362], [128, 418], [158, 455]], type: 'hair', weight: 2.0 },
    { pts: [[80, 230], [68, 295], [74, 355], [98, 410], [130, 450]], type: 'hair', weight: 1.5 },
    { pts: [[142, 120], [124, 172], [118, 235], [130, 298], [144, 355]], type: 'hair', weight: 1.8 },
    { pts: [[132, 185], [126, 245], [136, 310], [152, 365]], type: 'hair', weight: 1.4 },

    // Right cascading waves
    { pts: [[270, 62], [310, 100], [335, 155], [344, 220], [340, 288], [325, 355], [298, 415], [262, 455]], type: 'hair', weight: 2.4 },
    { pts: [[290, 118], [320, 175], [326, 242], [318, 310], [298, 375], [270, 432]], type: 'hair', weight: 1.9 },
    { pts: [[335, 195], [345, 255], [338, 320], [318, 385], [285, 440]], type: 'hair', weight: 1.5 },
    { pts: [[254, 98], [286, 148], [305, 205], [308, 268], [296, 330], [275, 390]], type: 'hair', weight: 1.7 },
    { pts: [[272, 160], [286, 218], [284, 278]], type: 'hair', weight: 1.2 },

    // Shoulders
    { pts: [[164, 405], [120, 432], [72, 460]], type: 'hair', weight: 1.4 },
    { pts: [[236, 405], [280, 432], [328, 460]], type: 'hair', weight: 1.4 },

    // ── 3. EXPRESSIVE INK SCRIBBLE LOOPS & WIRE SWIRLS (ARTISTIC TEXTURE) ──
    { pts: [[115, 180], [130, 210], [112, 245], [125, 275]], type: 'scribble', weight: 1.2 },
    { pts: [[105, 240], [120, 275], [102, 310], [118, 345]], type: 'scribble', weight: 1.3 },
    { pts: [[315, 230], [300, 265], [322, 298], [308, 332]], type: 'scribble', weight: 1.3 },
    { pts: [[122, 380], [140, 405], [125, 432], [146, 455]], type: 'scribble', weight: 1.2 },
    { pts: [[298, 375], [280, 402], [302, 428], [285, 452]], type: 'scribble', weight: 1.2 }
  ];

  function cr(pts: [number, number][], step: number): [number, number][] {
    const out: [number, number][] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts.at(i - 1) ?? pts[i];
      const p1 = pts.at(i)!;
      const p2 = pts.at(i + 1)!;
      const p3 = pts.at(i + 2) ?? p2;
      const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        const t2 = t * t;
        const t3 = t2 * t;
        out.push([
          0.5 *
            (2 * p1[0] +
              (-p0[0] + p2[0]) * t +
              (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
              (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 *
            (2 * p1[1] +
              (-p0[1] + p2[1]) * t +
              (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
              (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
        ]);
      }
    }
    const last = pts.at(pts.length - 1);
    if (last) out.push(last);
    return out;
  }

  interface ThreadStrand {
    base: [number, number][];
    si: number;
    type: 'feature' | 'hair' | 'scribble';
    lw: number;
    off: number;
    ph: number;
    ph2: number;
    curl: number;
    cf: number;
    al: number;
  }

  const rnd = seeded(77);
  const strands: ThreadStrand[] = [];
  STROKES.forEach((s, si) => {
    const base = cr(s.pts, 2.5);
    if (s.type === 'feature') {
      // Facial features use clean, single elegant ink lines with high fidelity
      strands.push({
        base,
        si,
        type: 'feature',
        lw: s.weight,
        off: 0,
        ph: rnd() * 6.28,
        ph2: rnd() * 6.28,
        curl: 0,
        cf: 0,
        al: 0.94
      });
    } else if (s.type === 'hair') {
      // Hair waves use 3-4 parallel and undulating wire strands
      const count = s.weight > 2 ? 4 : 3;
      for (let k = 0; k < count; k++) {
        strands.push({
          base,
          si,
          type: 'hair',
          lw: k === 0 ? s.weight * 0.95 : 0.85 + rnd() * 0.7,
          off: k === 0 ? 0.3 : 1.2 + rnd() * 2.6,
          ph: rnd() * 6.28,
          ph2: rnd() * 6.28,
          curl: 1.6 + rnd() * 2.8,
          cf: 0.35 + rnd() * 0.35,
          al: k === 0 ? 0.9 : 0.72 + rnd() * 0.2
        });
      }
    } else {
      // Artistic gestural scribble loops
      for (let k = 0; k < 2; k++) {
        strands.push({
          base,
          si,
          type: 'scribble',
          lw: 0.9 + rnd() * 0.6,
          off: 0.8 + rnd() * 2.0,
          ph: rnd() * 6.28,
          ph2: rnd() * 6.28,
          curl: 2.4 + rnd() * 3.5,
          cf: 0.45 + rnd() * 0.4,
          al: 0.75 + rnd() * 0.18
        });
      }
    }
  });

  let W = 0;
  let H = 0;
  let dpr = 1;
  let on = false;
  let running = false;
  let drawP = prefersReducedMotion ? 1 : 0;
  let started = 0;
  let animId = 0;

  const ptr = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, on: false };

  function size() {
    const r = cv.getBoundingClientRect();
    W = r.width;
    H = r.height;
    dpr = getDpr();
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    draw(performance.now());
  }

  function draw(now: number) {
    if (!ctx) return;
    const k = W / 400;
    const t = prefersReducedMotion ? 0 : now / 1000;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
    ctx.strokeStyle = threadColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ptr.x = lerp(ptr.x, ptr.tx, 0.12);
    ptr.y = lerp(ptr.y, ptr.ty, 0.12);
    const px = ptr.x / k;
    const py = ptr.y / k;
    const PR = 90;

    for (const s of strands) {
      const frac = clamp(drawP * 1.5 - (s.si / STROKES.length) * 0.5);
      if (frac <= 0) continue;
      const n = Math.max(2, Math.floor(s.base.length * frac));
      ctx.lineWidth = s.lw;
      ctx.globalAlpha = s.al;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const pt = s.base.at(i);
        if (!pt) continue;
        const [bx, by] = pt;

        let x = bx;
        let y = by;

        if (s.type === 'feature') {
          // Extremely subtle living breath — features stay crisp, beautiful & perfectly aligned
          x += 0.35 * Math.sin(by * 0.015 + t * 0.5);
          y += 0.35 * Math.cos(bx * 0.015 + t * 0.5);
        } else {
          // Hair and scribble loops undulate with rich, expressive organic wave motion
          x +=
            s.off * Math.sin(i * 0.08 + s.ph) +
            1.8 * Math.sin(by * 0.02 + t * 0.7 + s.ph2) +
            s.curl * Math.cos(i * s.cf + s.ph + t * 0.35);
          y +=
            s.off * Math.cos(i * 0.06 + s.ph) +
            1.8 * Math.cos(bx * 0.02 + t * 0.6 + s.ph) +
            s.curl * Math.sin(i * s.cf + s.ph + t * 0.35);
        }

        // Interactive cursor physics — gentle magnetic attraction
        if (ptr.on) {
          const dx = px - x;
          const dy = py - y;
          const d = Math.hypot(dx, dy);
          if (d < PR) {
            const power = s.type === 'feature' ? 0.22 : 0.36;
            const f = Math.pow(1 - d / PR, 2) * power;
            x += dx * f;
            y += dy * f;
          }
        }

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function frame(now: number) {
    if (!on) {
      running = false;
      return;
    }
    if (drawP < 1) drawP = clamp((now - started) / 3200);
    draw(now);
    animId = requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(
    (es) => {
      const isVis = es.at(0)?.isIntersecting ?? false;
      on = isVis;
      if (isVis && !prefersReducedMotion) {
        if (!started) started = performance.now();
        if (!running) {
          running = true;
          animId = requestAnimationFrame(frame);
        }
      }
    },
    { threshold: 0.1 }
  );
  observer.observe(cv);

  const onPointerMove = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect();
    ptr.tx = e.clientX - r.left;
    ptr.ty = e.clientY - r.top;
    if (!ptr.on) {
      ptr.x = ptr.tx;
      ptr.y = ptr.ty;
    }
    ptr.on = true;
    if (prefersReducedMotion) draw(0);
  };
  const onPointerLeave = () => {
    ptr.on = false;
    if (prefersReducedMotion) draw(0);
  };

  cv.addEventListener('pointermove', onPointerMove);
  cv.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('resize', size);

  size();

  return () => {
    cancelAnimationFrame(animId);
    observer.disconnect();
    cv.removeEventListener('pointermove', onPointerMove);
    cv.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('resize', size);
  };
}

// ─── 3. REVEALING INK POEM CANVAS (SEGMENTED EDITORIAL REVELATION) ───────────
export interface CuratedPoem {
  title: string;
  book: string;
  lines: string[];
}

export const CURATED_POEMS: CuratedPoem[] = [
  {
    title: 'How My Poems Are Created',
    book: 'Lust, Love, and Memories',
    lines: [
      'Whenever I want to write you,',
      'I write me.'
    ]
  },
  {
    title: 'Unflourished',
    book: 'The Longest Nights',
    lines: [
      'Some flowers get killed',
      'before they get their chance to flourish.'
    ]
  },
  {
    title: 'Entry as Exit',
    book: 'The Longest Nights',
    lines: [
      'Enter, come in, you are welcomed.',
      'I want to break free,',
      'the only way of doing so is opening the door.'
    ]
  },
  {
    title: 'Shattered Glass',
    book: 'The Longest Nights',
    lines: [
      'Some memories stay with you like shattered glass,',
      'making you bleed every time you stumble upon them.'
    ]
  },
  {
    title: 'The Longest Nights',
    book: 'The Longest Nights',
    lines: [
      'I wear a sleep mask to bed.',
      'Every time I lift it up,',
      'I pray that it is already morning.'
    ]
  },
  {
    title: 'Peace',
    book: 'The Longest Nights',
    lines: [
      'We already lost each other many weeks ago.',
      'I am getting back my peace.'
    ]
  },
  {
    title: 'For Emotions',
    book: 'Lust, Love, and Memories',
    lines: [
      'I will always make time for emotions,',
      'and that’s how this book came to be.'
    ]
  },
  {
    title: 'Soft Spot',
    book: 'Lust, Love, and Memories',
    lines: [
      'Softness is my soft spot.',
      'We were creating art.'
    ]
  }
];

export const CURATED_POEM_SEGMENTS: string[][] = CURATED_POEMS.map((p) => p.lines);

export function initRevealingPoem(
  cv: HTMLCanvasElement,
  stanzasOrPoems: CuratedPoem[] | string[][] | string[],
  prefersReducedMotion: boolean,
  color = '#141312'
): () => void {
  const ctx = cv.getContext('2d');
  if (!ctx) return NOOP;

  // Normalize input into an array of CuratedPoem objects
  const poemsList: CuratedPoem[] = Array.isArray(stanzasOrPoems)
    ? (stanzasOrPoems as (CuratedPoem | string[] | string)[]).map((item) => {
        if (typeof item === 'object' && item !== null && 'lines' in item) {
          return item as CuratedPoem;
        }
        if (Array.isArray(item)) {
          return {
            title: 'Selected Verse',
            book: 'Lust, Love, and Memories',
            lines: item as string[]
          };
        }
        return {
          title: 'Selected Verse',
          book: 'Lust, Love, and Memories',
          lines: [String(item)]
        };
      })
    : [];

  interface CharGlyph {
    ch: string;
    x: number;
    y: number;
    w: number;
    reveal: number;
    targetReveal: number;
    revealed: boolean;
    lastTouch: number;
    isAttribution: boolean;
    fontSize: number;
    color: string;
  }

  let W = 0;
  let H = 0;
  let dpr = 1;
  let chars: CharGlyph[] = [];
  let on = false;
  let running = false;
  let animId = 0;

  let currentPoemIdx = 0;
  let isFullyRevealed = false;
  let fullyRevealedTime = 0;
  let isFadingOut = false;
  let fadeStartTime = 0;
  let hasStarted = false;
  let lastActivityTime = performance.now();

  const ptr = { x: -1e4, y: -1e4, px: -1e4, py: -1e4, on: false };

  function layoutCurrentPoem() {
    const r = cv.getBoundingClientRect();
    W = r.width;
    H = r.height;
    dpr = getDpr();
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);

    const activePoem = poemsList.at(currentPoemIdx) ?? poemsList.at(0);
    if (!activePoem) return;

    const verseLines = activePoem.lines;

    // Scaled typography (+20% size as requested)
    // Desktop: 41px (was 34px), Tablet: 34px (was 28px), Mobile: 27px (was 23px)
    const fontSize = W < 540 ? 27 : W < 768 ? 34 : 41;
    const lineHeight = Math.round(fontSize * 1.72);

    // Citation font size matching subheader ("Move your mouse over to uncover the letters.") exactly:
    // .sec-desc = clamp(1rem, 0.95rem + 0.25vw, 1.18rem) -> Desktop: 21px, Tablet: 19px, Mobile: 18px
    const citationFontSize = W < 540 ? 18 : W < 768 ? 19 : 21;
    const citationLineHeight = Math.round(citationFontSize * 1.55);
    const citationSpacing = Math.round(fontSize * 1.25);

    // Standard literary attribution (regular, not italic): "— [Title] · [Book]"
    ctx!.font = `normal ${citationFontSize}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;
    const singleLineCitation = `— ${activePoem.title} · ${activePoem.book}`;
    const singleWidth = ctx!.measureText(singleLineCitation).width;
    const maxCitationWidth = Math.max(120, W - 48);

    const citationLines =
      singleWidth <= maxCitationWidth
        ? [singleLineCitation]
        : [`— ${activePoem.title}`, activePoem.book];

    const totalVerseHeight = (verseLines.length - 1) * lineHeight;
    const totalCitationHeight = (citationLines.length - 1) * citationLineHeight;
    const totalBlockHeight = totalVerseHeight + citationSpacing + totalCitationHeight;

    const startY = Math.max(30, Math.round((H - totalBlockHeight) / 2 + fontSize * 0.72));

    chars = [];

    // 1. Layout verse lines character-by-character
    verseLines.forEach((line, lineIdx) => {
      ctx!.font = `italic ${fontSize}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;
      const lineWords = line.split(' ');
      const spaceW = Math.max(ctx!.measureText(' ').width, Math.round(fontSize * 0.32));
      let totalLineWidth = 0;
      const wordWidths = lineWords.map((w) => {
        const mw = ctx!.measureText(w).width;
        totalLineWidth += mw + spaceW;
        return mw;
      });
      totalLineWidth -= spaceW;

      let currentX = Math.max(16, Math.round((W - totalLineWidth) / 2));
      const y = startY + lineIdx * lineHeight;

      lineWords.forEach((word, wIdx) => {
        const len = word.length;
        for (let i = 0; i < len; i++) {
          const ch = word.charAt(i);
          const leftAdv = i === 0 ? 0 : ctx!.measureText(word.substring(0, i)).width;
          const rightAdv = ctx!.measureText(word.substring(0, i + 1)).width;
          const charW = Math.max(rightAdv - leftAdv, ctx!.measureText(ch).width);

          chars.push({
            ch,
            x: currentX + leftAdv,
            y,
            w: charW,
            reveal: prefersReducedMotion ? 1 : 0,
            targetReveal: prefersReducedMotion ? 1 : 0,
            revealed: prefersReducedMotion,
            lastTouch: 0,
            isAttribution: false,
            fontSize,
            color
          });
        }
        const w = wordWidths.at(wIdx) ?? 40;
        currentX += w + spaceW;
      });
    });

    // 2. Layout citation line(s) character-by-character (Regular font, matching .sec-desc size)
    citationLines.forEach((cLine, cIdx) => {
      ctx!.font = `normal ${citationFontSize}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;
      const cWords = cLine.split(' ');
      const spaceW = Math.max(ctx!.measureText(' ').width, Math.round(citationFontSize * 0.32));
      let totalLineWidth = 0;
      const wordWidths = cWords.map((w) => {
        const mw = ctx!.measureText(w).width;
        totalLineWidth += mw + spaceW;
        return mw;
      });
      totalLineWidth -= spaceW;

      let currentX = Math.max(16, Math.round((W - totalLineWidth) / 2));
      const y = startY + (verseLines.length - 1) * lineHeight + citationSpacing + cIdx * citationLineHeight;

      cWords.forEach((word, wIdx) => {
        const len = word.length;
        for (let i = 0; i < len; i++) {
          const ch = word.charAt(i);
          const leftAdv = i === 0 ? 0 : ctx!.measureText(word.substring(0, i)).width;
          const rightAdv = ctx!.measureText(word.substring(0, i + 1)).width;
          const charW = Math.max(rightAdv - leftAdv, ctx!.measureText(ch).width);

          chars.push({
            ch,
            x: currentX + leftAdv,
            y,
            w: charW,
            reveal: prefersReducedMotion ? 1 : 0,
            targetReveal: prefersReducedMotion ? 1 : 0,
            revealed: prefersReducedMotion,
            lastTouch: 0,
            isAttribution: true,
            fontSize: citationFontSize,
            color: '#57534e'
          });
        }
        const w = wordWidths.at(wIdx) ?? 28;
        currentX += w + spaceW;
      });
    });

    isFullyRevealed = prefersReducedMotion;
    fullyRevealedTime = 0;
    isFadingOut = false;
    hasStarted = false;

    draw(performance.now());
  }

  function draw(now: number) {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textBaseline = 'alphabetic';

    // Precise letter-by-letter quill uncover (no wide radial spill)
    if (!prefersReducedMotion && ptr.on && !isFadingOut) {
      lastActivityTime = now;
      const distMoved = Math.hypot(ptr.x - ptr.px, ptr.y - ptr.py);
      const steps = Math.max(1, Math.min(25, Math.ceil(distMoved / 6)));

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const ix = ptr.px + (ptr.x - ptr.px) * t;
        const iy = ptr.py + (ptr.y - ptr.py) * t;

        for (const c of chars) {
          if (c.revealed) continue;
          if (c.isAttribution) continue;
          const charCenterX = c.x + c.w / 2;
          const halfW = Math.max(c.w * 0.55 + 2, 8);
          const inX = Math.abs(ix - charCenterX) <= halfW;
          const inY = iy >= c.y - c.fontSize * 0.88 && iy <= c.y + c.fontSize * 0.28;

          if (inX && inY) {
            c.targetReveal = 1.0;
            c.revealed = true;
            c.lastTouch = now;
            hasStarted = true;
          }
        }
      }
      ptr.px = ptr.x;
      ptr.py = ptr.y;
    }

    // Check if entire verse has been uncovered by the user passing the feather over it
    if (!isFullyRevealed && !isFadingOut) {
      const verseChars = chars.filter((c) => !c.isAttribution && c.ch.trim().length > 0);
      if (verseChars.length > 0) {
        const unrevealedLetters = verseChars.filter(
          (c) => !c.revealed && /\p{L}|\p{N}/u.test(c.ch)
        );
        if (unrevealedLetters.length === 0) {
          isFullyRevealed = true;
          fullyRevealedTime = now;
          // Ensure any remaining punctuation marks within the verse bloom
          for (const c of verseChars) {
            c.targetReveal = 1.0;
            c.revealed = true;
          }
        }
      }
    }

    // 1-second delay after poem is uncovered before fading in the attribution line (title + book)
    if (isFullyRevealed && !isFadingOut && fullyRevealedTime > 0) {
      if (now - fullyRevealedTime >= 1000) {
        const attributionChars = chars.filter((c) => c.isAttribution);
        for (const c of attributionChars) {
          c.targetReveal = 1.0;
          c.revealed = true;
        }
      }
    }

    // If fully revealed, hold visible for 30 seconds, then start fade out
    if (isFullyRevealed && !isFadingOut && fullyRevealedTime > 0) {
      if (now - fullyRevealedTime >= 30000) {
        isFadingOut = true;
        fadeStartTime = now;
      }
    }

    // Fallback: If user partially revealed characters then walked away for > 40s, cycle forward
    if (hasStarted && !isFullyRevealed && !isFadingOut && !ptr.on) {
      if (now - lastActivityTime > 40000) {
        isFadingOut = true;
        fadeStartTime = now;
      }
    }

    // Calculate fade-out multiplier if in fadingOut state
    let fadeMultiplier = 1.0;
    if (isFadingOut) {
      const elapsed = now - fadeStartTime;
      const FADE_DURATION = 2000;
      fadeMultiplier = Math.max(0, 1 - elapsed / FADE_DURATION);

      if (fadeMultiplier <= 0) {
        // Transition to next poem segment
        currentPoemIdx = (currentPoemIdx + 1) % poemsList.length;
        layoutCurrentPoem();
        return;
      }
    }

    // Render characters
    for (const c of chars) {
      if (!prefersReducedMotion) {
        if (c.isAttribution) {
          if (!isFullyRevealed || fullyRevealedTime <= 0) {
            c.reveal = 0;
          } else {
            // 200% longer transition (~1.6s smooth literary fade-in) after the 1s delay
            const elapsed = (now - fullyRevealedTime) - 1000;
            if (elapsed <= 0) {
              c.reveal = 0;
            } else {
              const t = Math.min(1, elapsed / 1600);
              c.reveal = t * (2 - t);
            }
          }
        } else {
          c.reveal = lerp(c.reveal, c.targetReveal, 0.16);
        }
      } else {
        c.reveal = 1.0;
      }

      const alpha = c.reveal * fadeMultiplier;
      if (alpha <= 0.005) continue;

      ctx.save();
      const fontStyle = c.isAttribution ? 'normal' : 'italic';
      ctx.font = `${fontStyle} ${c.fontSize}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;
      ctx.fillStyle = c.color ?? color;
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.fillText(c.ch, c.x, c.y);
      ctx.restore();
    }
  }

  function frame(now: number) {
    if (!on) {
      running = false;
      return;
    }
    draw(now);
    animId = requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(
    (es) => {
      const isVis = es.at(0)?.isIntersecting ?? false;
      on = isVis;
      if (isVis && !prefersReducedMotion) {
        if (!running) {
          running = true;
          animId = requestAnimationFrame(frame);
        }
      }
    },
    { threshold: 0.1 }
  );
  observer.observe(cv);

  const onPointerMove = (e: MouseEvent) => {
    const r = cv.getBoundingClientRect();
    const nx = e.clientX - r.left;
    const ny = e.clientY - r.top;
    if (!ptr.on) {
      ptr.px = nx;
      ptr.py = ny;
    }
    ptr.x = nx;
    ptr.y = ny;
    ptr.on = true;
    if (!running && !prefersReducedMotion) {
      running = true;
      animId = requestAnimationFrame(frame);
    }
  };

  const onPointerLeave = () => {
    ptr.on = false;
    ptr.px = -1e4;
    ptr.py = -1e4;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!e.touches.length) return;
    const t = e.touches.item(0);
    if (!t) return;
    const r = cv.getBoundingClientRect();
    const nx = t.clientX - r.left;
    const ny = t.clientY - r.top;
    if (!ptr.on) {
      ptr.px = nx;
      ptr.py = ny;
    }
    ptr.x = nx;
    ptr.y = ny;
    ptr.on = true;
    if (!running && !prefersReducedMotion) {
      running = true;
      animId = requestAnimationFrame(frame);
    }
  };

  cv.addEventListener('mousemove', onPointerMove, { passive: true });
  cv.addEventListener('mouseleave', onPointerLeave, { passive: true });
  cv.addEventListener('touchstart', onTouchMove, { passive: true });
  cv.addEventListener('touchmove', onTouchMove, { passive: true });
  cv.addEventListener('touchend', onPointerLeave, { passive: true });
  window.addEventListener('resize', layoutCurrentPoem, { passive: true });

  layoutCurrentPoem();

  return () => {
    cancelAnimationFrame(animId);
    observer.disconnect();
    cv.removeEventListener('mousemove', onPointerMove);
    cv.removeEventListener('mouseleave', onPointerLeave);
    cv.removeEventListener('touchstart', onTouchMove);
    cv.removeEventListener('touchmove', onTouchMove);
    cv.removeEventListener('touchend', onPointerLeave);
    window.removeEventListener('resize', layoutCurrentPoem);
  };
}

// ─── 4. ON GRAVITY / FALLING WORDS SIMULATION CANVAS (LEGACY) ────────────────
export function initGravitySimulation(
  cv: HTMLCanvasElement,
  passage: string,
  prefersReducedMotion: boolean,
  color = '#141312'
): () => void {
  const ctx = cv.getContext('2d');
  if (!ctx) return NOOP;

  interface GravitySlot {
    ch: string;
    x: number;
    y: number;
    row: number;
    here: number;
    back: number;
    fadeIn?: number;
  }

  interface GravityParticle {
    ch: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    a: number;
    va: number;
    st: number;
    al?: number;
    dying?: number;
    gone?: number;
  }

  let W = 0;
  let H = 0;
  let dpr = 1;
  let fs = 13;
  let cw = 8;
  let lh = 18;
  let slots: GravitySlot[] = [];
  let falling: GravityParticle[] = [];
  let bins: number[] = [];
  let stacks: GravityParticle[][] = [];
  let binW = 8;
  let x0 = 0;
  let floorY = 0;
  let apexX = 0;
  let on = false;
  let running = false;
  let lastSpawn = 0;
  let rows = 0;
  let frameN = 0;
  let animId = 0;

  const ptr = { x: -1e4, y: -1e4, px: 0, py: 0, on: false };

  function setup() {
    const r = cv.getBoundingClientRect();
    W = r.width;
    H = r.height;
    dpr = getDpr();
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    fs = W < 520 ? 10 : 13;
    lh = Math.round(fs * 1.38);
    ctx!.font = `${fs}px "Courier Prime", "Courier New", monospace`;
    cw = ctx!.measureText('M').width;

    const maxCols = Math.min(Math.floor((W * 0.94) / cw), 64);
    rows = Math.floor((H * 0.52) / lh);
    slots = [];
    let k = 0;

    for (let rIdx = 0; rIdx < rows; rIdx++) {
      const t = rIdx / (rows - 1);
      const cols = Math.max(1, Math.round(maxCols * Math.pow(1 - t, 1.25)));
      const sx = W / 2 - (cols * cw) / 2;
      const y = 10 + rIdx * lh + lh / 2;
      for (let c = 0; c < cols; c++) {
        const ch = passage.at(k++ % passage.length);
        if (ch && ch !== ' ') {
          slots.push({ ch, x: sx + c * cw, y, row: rIdx, here: 1, back: 0 });
        }
      }
      while (passage.at(k % passage.length) === ' ') k++;
    }

    apexX = W / 2 - cw / 2;
    floorY = H - 14;
    binW = cw * 0.8;
    x0 = 0;
    const nb = Math.ceil(W / binW);
    bins = new Array(nb).fill(0);
    stacks = Array.from({ length: nb }, () => []);
    falling = [];

    draw(performance.now());
  }

  function drop(s: GravitySlot, vx = 0) {
    s.here = 0;
    s.back = performance.now() + (vx ? 5000 + Math.random() * 4000 : 900 + Math.random() * 1600);
    falling.push({
      ch: s.ch,
      x: s.x,
      y: s.y,
      vx: vx + (apexX - s.x) * 0.004,
      vy: 0,
      a: 0,
      va: (Math.random() - 0.5) * 0.08,
      st: 0
    });
  }

  function settle(p: GravityParticle) {
    let b = clamp(Math.floor((p.x + cw / 2 - x0) / binW), 0, bins.length - 1);
    for (let it = 0; it < 30; it++) {
      const l = b > 0 ? (bins.at(b - 1) ?? 1e9) : 1e9;
      const r = b < bins.length - 1 ? (bins.at(b + 1) ?? 1e9) : 1e9;
      const curr = bins.at(b) ?? 0;
      if (curr > Math.min(l, r)) {
        b = l < r ? b - 1 : r < l ? b + 1 : Math.random() < 0.5 ? b - 1 : b + 1;
      } else {
        break;
      }
    }
    p.st = 1;
    p.x = x0 + b * binW + (Math.random() - 0.5) * binW * 0.5 - cw / 2 + binW / 2;
    const currentPile = bins.at(b) ?? 0;
    p.y = floorY - currentPile * lh * 0.42 - lh * 0.2;
    p.a = (Math.random() - 0.5) * 1.2;
    p.al = 1;
    bins[b] = currentPile + 1;
    stacks.at(b)?.push(p);
  }

  function step(now: number) {
    if (!prefersReducedMotion) {
      if (now - lastSpawn > 95) {
        lastSpawn = now;
        const cand = slots.filter((s) => s.here && s.row >= rows - 3);
        if (cand.length) {
          cand.sort((a, b) => b.row - a.row || Math.abs(a.x - apexX) - Math.abs(b.x - apexX));
          const chosen = cand.at(Math.min(cand.length - 1, (Math.random() * Math.min(4, cand.length)) | 0));
          if (chosen) drop(chosen);
        }
      }
      if (ptr.on) {
        const vx = (ptr.x - ptr.px) * 0.08;
        for (const s of slots) {
          if (s.here && Math.abs(s.x + cw / 2 - ptr.x) < cw * 1.6 && Math.abs(s.y - ptr.y) < lh * 0.9) {
            drop(s, vx);
          }
        }
        ptr.px = ptr.x;
        ptr.py = ptr.y;
      }
    }

    for (const s of slots) {
      if (!s.here && now > s.back) {
        s.here = 1;
        s.fadeIn = now;
      }
    }

    const g = 0.22;
    for (const p of falling) {
      if (p.st) continue;
      p.vy += g;
      p.vx *= 0.992;
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.va;
      const b = clamp(Math.floor((p.x + cw / 2 - x0) / binW), 0, bins.length - 1);
      const pile = bins.at(b) ?? 0;
      if (p.y >= floorY - pile * lh * 0.42 - lh * 0.2) settle(p);
    }

    let settled = 0;
    for (const s of stacks) settled += s.length;
    const cap = W < 520 ? 360 : 700;
    if (settled > cap) {
      for (let tries = 0; tries < 6; tries++) {
        const b = (Math.random() * bins.length) | 0;
        const stack = stacks.at(b);
        const top = stack?.at(stack.length - 1);
        if (top && !top.dying) {
          top.dying = now;
          break;
        }
      }
    }

    for (let b = 0; b < stacks.length; b++) {
      const st = stacks.at(b);
      const top = st?.at(st.length - 1);
      if (top && top.dying) {
        top.al = 1 - (now - top.dying) / 900;
        if (top.al <= 0) {
          st?.pop();
          const pile = bins.at(b) ?? 1;
          bins[b] = Math.max(0, pile - 1);
          top.gone = 1;
        }
      }
    }

    if (falling.length > 1500) {
      falling = falling.filter((p) => !p.gone);
    } else if (frameN++ % 120 === 0) {
      falling = falling.filter((p) => !p.gone);
    }
  }

  function draw(now: number) {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${fs}px "Courier Prime", "Courier New", monospace`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;

    for (const s of slots) {
      if (!s.here) continue;
      ctx.globalAlpha = s.fadeIn ? clamp((now - s.fadeIn) / 900) : 1;
      ctx.fillText(s.ch, s.x, s.y);
    }

    for (const p of falling) {
      if (p.gone) continue;
      ctx.globalAlpha = p.st ? (p.al ?? 1) * 0.85 : 1;
      const co = Math.cos(p.a) * dpr;
      const si = Math.sin(p.a) * dpr;
      ctx.setTransform(co, si, -si, co, (p.x + cw / 2) * dpr, p.y * dpr);
      ctx.fillText(p.ch, -cw / 2, 0);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
  }

  function frame(now: number) {
    if (!on) {
      running = false;
      return;
    }
    step(now);
    draw(now);
    animId = requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(
    (es) => {
      const isVis = es.at(0)?.isIntersecting ?? false;
      on = isVis;
      if (isVis && !prefersReducedMotion && !running) {
        running = true;
        animId = requestAnimationFrame(frame);
      }
    },
    { threshold: 0.1 }
  );
  observer.observe(cv);

  const setP = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect();
    ptr.x = e.clientX - r.left;
    ptr.y = e.clientY - r.top;
    if (!ptr.on) {
      ptr.px = ptr.x;
      ptr.py = ptr.y;
    }
    ptr.on = true;
  };

  cv.addEventListener('pointermove', setP);
  cv.addEventListener('pointerdown', setP);
  cv.addEventListener('pointerleave', () => (ptr.on = false));
  cv.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'mouse') ptr.on = false;
  });

  window.addEventListener('resize', setup);
  setup();

  return () => {
    cancelAnimationFrame(animId);
    observer.disconnect();
    cv.removeEventListener('pointermove', setP);
    cv.removeEventListener('pointerdown', setP);
    window.removeEventListener('resize', setup);
  };
}

// ─── 4. WALKING FIGURE IN TEXT AT FOOTER CANVAS ──────────────────────────────
export function initWalkingFigure(
  cv: HTMLCanvasElement,
  containerEl: HTMLElement,
  prefersReducedMotion: boolean,
  color = '#141312'
): () => void {
  const ctx = cv.getContext('2d');
  if (!ctx) return NOOP;

  const TEXT =
    'Happy moments, lust, love, and memories linger in the dark. Somebody is always healing, somebody is always leaving, somebody is always beginning again... ';
  let W = 0;
  let H = 0;
  let dpr = 1;
  let chars: { ch: string; x: number; y: number; w: number }[] = [];
  const ptr = { x: -1e4, y: -1e4 };
  let req = false;

  function setup() {
    const r = cv.getBoundingClientRect();
    W = r.width;
    H = r.height;
    dpr = getDpr();
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);

    const m = document.createElement('canvas');
    m.width = Math.ceil(W);
    m.height = Math.ceil(H);
    const g = m.getContext('2d');
    if (!g) return;

    const scale = Math.min(W / WALKER.w, H / WALKER.h);
    const ox = (W - WALKER.w * scale) / 2;
    const oy = (H - WALKER.h * scale) / 2;
    g.translate(ox, oy);
    g.scale(scale, scale);
    drawOps(g, WALKER.ops);
    const md = g.getImageData(0, 0, m.width, m.height).data;

    const inside = (x: number, y: number) => {
      x |= 0;
      y |= 0;
      return x >= 0 && y >= 0 && x < m.width && y < m.height && (md.at((y * m.width + x) * 4 + 3) ?? 0) > 120;
    };

    const figH = WALKER.h * scale;
    const fs = Math.max(8, Math.min(13, figH / 17));
    const lh = fs * 1.12;
    ctx!.font = `italic ${fs}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;
    chars = [];
    let k = 0;

    for (let y = oy + lh / 2; y < oy + figH; y += lh) {
      let x = ox;
      const endX = ox + WALKER.w * scale;
      while (x < endX) {
        const ch = TEXT.at(k % TEXT.length) ?? ' ';
        const w = ctx!.measureText(ch).width || fs * 0.35;
        if (inside(x + w / 2, y)) {
          chars.push({ ch, x, y, w });
          k++;
        }
        x += w;
      }
    }
    draw();
  }

  function draw() {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';

    const scale = Math.min(W / WALKER.w, H / WALKER.h);
    const figH = WALKER.h * scale;
    const fs = Math.max(8, Math.min(13, figH / 17));
    ctx.font = `italic ${fs}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;

    for (const c of chars) {
      const near = Math.hypot(c.x - ptr.x, c.y - ptr.y) < W * 0.35;
      ctx.globalAlpha = near ? 1 : 0.78;
      ctx.fillText(c.ch, c.x, c.y);
    }
    ctx.globalAlpha = 1;
  }

  const onPointerMove = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect();
    ptr.x = e.clientX - r.left;
    ptr.y = e.clientY - r.top;
    if (!req) {
      req = true;
      requestAnimationFrame(() => {
        req = false;
        draw();
      });
    }
  };

  const onPointerLeave = () => {
    ptr.x = ptr.y = -1e4;
    draw();
  };

  const onScroll = () => {
    if (prefersReducedMotion) return;
    const r = containerEl.getBoundingClientRect();
    const p = clamp(1 - r.top / window.innerHeight);
    cv.style.setProperty('--walk', `${(p * Math.min(window.innerWidth * 0.06, 70)).toFixed(1)}px`);
  };

  cv.addEventListener('pointermove', onPointerMove);
  cv.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', setup);

  setup();

  return () => {
    cv.removeEventListener('pointermove', onPointerMove);
    cv.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', setup);
  };
}
