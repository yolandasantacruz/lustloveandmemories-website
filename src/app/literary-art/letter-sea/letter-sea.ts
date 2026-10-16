import { lerp, seeded, getDpr, NOOP } from '../common/math';

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
