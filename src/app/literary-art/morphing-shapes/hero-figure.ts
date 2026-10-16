import { SHAPES } from './shapes.data';
import { packShape, PackedShapeResult } from './shape-packer';
import { clamp, lerp, easeIO, seeded, getDpr, NOOP } from '../common/math';

export interface HeroTarget {
  x: number;
  y: number;
  size: number;
  a: number;
  ch: string;
  it: boolean;
  al: number;
}

export interface HeroGlyph {
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

  const packs: PackedShapeResult[] = [];
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

  function getPack(i: number): PackedShapeResult {
    const existing = packs.at(i);
    if (!existing) {
      const packed = packShape(SHAPES.at(i) ?? SHAPES[0], 101 + i * 17);
      packs[i] = packed;
      return packed;
    }
    return existing;
  }

  function fit(pack: PackedShapeResult) {
    const [x0, y0, x1, y1] = pack.bbox;
    const bw = x1 - x0;
    const bh = y1 - y0;
    const boxW = W * 0.82;
    const boxH = H * 0.82;
    const s = Math.min(boxW / bw, boxH / bh);
    return { s, ox: (W - bw * s) / 2 - x0 * s, oy: (H - bh * s) / 2 - y0 * s };
  }

  function target(pi: number, i: number): HeroTarget {
    const pk = getPack(pi);
    const f = fit(pk);
    const p = pk.placed.at(i);
    if (!p) {
      const q = pk.placed.at(i % pk.placed.length) ?? pk.placed[0];
      return {
        x: q.x * f.s + f.ox,
        y: q.y * f.s + f.oy,
        size: 0,
        a: q.a ?? 0,
        ch: q.ch ?? 'a',
        it: q.it ?? false,
        al: 0
      };
    }
    return {
      x: p.x * f.s + f.ox,
      y: p.y * f.s + f.oy,
      size: p.r * f.s * 3.25,
      a: p.a ?? 0,
      ch: p.ch ?? 'a',
      it: p.it ?? false,
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

  function draw(now: number): boolean {
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
    if (busy || ptr.on || morphStart > 0) {
      idleAt = now;
      animId = requestAnimationFrame(frame);
    } else if (now - idleAt < 2000) {
      animId = requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  function start() {
    if (running || prefersReducedMotion) return;
    running = true;
    idleAt = performance.now();
    animId = requestAnimationFrame(frame);
  }

  btn.addEventListener('click', morph);

  const setP = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect();
    ptr.x = e.clientX - r.left;
    ptr.y = e.clientY - r.top;
    ptr.on = true;
    start();
  };
  heroEl.addEventListener('pointermove', setP);
  heroEl.addEventListener('pointerdown', setP);
  heroEl.addEventListener('pointerleave', () => (ptr.on = false));
  heroEl.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'mouse') setTimeout(() => (ptr.on = false), 300);
  });
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
