import { clamp, getDpr, NOOP } from '../common/math';

export interface GravitySlot {
  ch: string;
  x: number;
  y: number;
  row: number;
  here: number;
  back: number;
  fadeIn?: number;
}

export interface GravityParticle {
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

export function initGravitySimulation(
  cv: HTMLCanvasElement,
  passage: string,
  prefersReducedMotion: boolean,
  color = '#141312'
): () => void {
  const ctx = cv.getContext('2d');
  if (!ctx) return NOOP;

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

  function start() {
    if (running) return;
    running = true;
    animId = requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(
    (es) => {
      const isVisible = es.at(0)?.isIntersecting ?? false;
      on = isVisible;
      if (isVisible) start();
    },
    { rootMargin: '100px' }
  );
  observer.observe(cv);

  const setP = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect();
    ptr.x = e.clientX - r.left;
    ptr.y = e.clientY - r.top;
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
