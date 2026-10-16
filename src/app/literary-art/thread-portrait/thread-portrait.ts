import { clamp, lerp, seeded, getDpr, NOOP } from '../common/math';

export interface ThreadStroke {
  pts: [number, number][];
  type: 'feature' | 'hair' | 'scribble';
  weight: number;
}

export interface ThreadStrand {
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

// Artistic, delicate ink-scribble wire paths tailored to Yolanda's portrait
export const STROKES: ThreadStroke[] = [
  // ── 1. DELICATE FACIAL FEATURES (HIGH FIDELITY & WARMTH) ──
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

export function initThreadPortrait(
  cv: HTMLCanvasElement,
  prefersReducedMotion: boolean,
  threadColor = '#141312'
): () => void {
  const ctx = cv.getContext('2d');
  if (!ctx) return NOOP;

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
    if (drawP < 1 && started > 0) {
      const elapsed = (now - started) / 1000;
      drawP = prefersReducedMotion ? 1 : clamp(elapsed / 2.6);
    }
    draw(now);
    animId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    if (!started) started = performance.now();
    animId = requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(
    (es) => {
      const isVisible = es.at(0)?.isIntersecting ?? false;
      on = isVisible;
      if (isVisible) start();
    },
    { rootMargin: '120px' }
  );
  observer.observe(cv);

  const onPointerMove = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect();
    ptr.tx = e.clientX - r.left;
    ptr.ty = e.clientY - r.top;
    ptr.on = true;
    start();
  };

  const onPointerLeave = () => {
    ptr.on = false;
    ptr.tx = ptr.ty = -1e4;
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
