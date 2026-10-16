import { WRITER } from './writer.data';
import { drawOps } from '../morphing-shapes/shape-packer';
import { clamp, getDpr, NOOP } from '../common/math';

export interface WritingFigureHandle {
  destroy: () => void;
  sendNote: () => void;
}

export function initWritingFigure(
  cv: HTMLCanvasElement,
  containerEl: HTMLElement,
  prefersReducedMotion: boolean,
  color = '#141312'
): WritingFigureHandle {
  const ctx = cv.getContext('2d');
  if (!ctx) {
    return { destroy: NOOP, sendNote: NOOP };
  }

  const TEXT =
    'Lust, love, and memories written by candlelight. Every letter is a secret kept between the paper and the soul. We write to remember, we write to heal, somebody is always waiting for a word to arrive... ';
  let W = 0;
  let H = 0;
  let dpr = 1;
  let chars: { ch: string; x: number; y: number; w: number }[] = [];
  const ptr = { x: -1e4, y: -1e4 };
  let req = false;
  let currentScale = 1;
  let currentOx = 0;
  let currentOy = 0;

  function setup() {
    if (typeof document === 'undefined') return;
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

    currentScale = Math.min(W / WRITER.w, H / WRITER.h);
    currentOx = (W - WRITER.w * currentScale) / 2;
    currentOy = (H - WRITER.h * currentScale) / 2;
    g.translate(currentOx, currentOy);
    g.scale(currentScale, currentScale);
    drawOps(g, WRITER.ops);
    const md = g.getImageData(0, 0, m.width, m.height).data;

    const inside = (x: number, y: number) => {
      x |= 0;
      y |= 0;
      return x >= 0 && y >= 0 && x < m.width && y < m.height && (md.at((y * m.width + x) * 4 + 3) ?? 0) > 120;
    };

    const figH = WRITER.h * currentScale;
    const fs = Math.max(9, Math.min(12.5, figH / 22));
    const lh = fs * 1.15;
    ctx!.font = `italic ${fs}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;
    chars = [];
    let k = 0;

    for (let y = currentOy + lh / 2; y < currentOy + figH; y += lh) {
      let x = currentOx;
      const endX = currentOx + WRITER.w * currentScale;
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

    const figH = WRITER.h * currentScale;
    const fs = Math.max(9, Math.min(12.5, figH / 22));
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
    if (prefersReducedMotion || typeof window === 'undefined') return;
    const r = containerEl.getBoundingClientRect();
    const p = clamp(1 - r.top / window.innerHeight);
    cv.style.setProperty('--walk', `${(p * Math.min(window.innerWidth * 0.04, 50)).toFixed(1)}px`);
  };

  // ─── EASTER EGG: FLYING NOTE ANIMATION ────────────────────────────────────
  function triggerFlyingNote() {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    const cvRect = cv.getBoundingClientRect();
    // Desk paper location in viewport coordinates:
    // WRITER.ops has paper sheet centered around x: 95, y: 67
    const startX = cvRect.left + currentOx + 95 * currentScale;
    const startY = cvRect.top + currentOy + 67 * currentScale;

    // Overlay stage for the flying easter egg
    const stage = document.createElement('div');
    stage.setAttribute('aria-hidden', 'true');
    stage.style.position = 'fixed';
    stage.style.left = '0';
    stage.style.top = '0';
    stage.style.width = '100vw';
    stage.style.height = '100vh';
    stage.style.pointerEvents = 'none';
    stage.style.zIndex = '9999';
    stage.style.overflow = 'hidden';

    // The folded parchment paper sheet
    const paper = document.createElement('div');
    paper.style.position = 'absolute';
    paper.style.left = '0';
    paper.style.top = '0';
    paper.style.width = '36px';
    paper.style.height = '26px';
    paper.style.backgroundColor = '#FAF7F2';
    paper.style.border = '1px solid rgba(120, 113, 108, 0.4)';
    paper.style.borderRadius = '2px';
    paper.style.boxShadow = '0 8px 24px rgba(28, 22, 16, 0.22)';
    paper.style.transformOrigin = 'center center';
    paper.style.willChange = 'transform, opacity';
    paper.style.boxSizing = 'border-box';
    paper.style.padding = '3px 4px';
    paper.style.display = 'flex';
    paper.style.flexDirection = 'column';
    paper.style.justifyContent = 'space-between';

    // Delicate handwritten lines and crimson seal
    paper.innerHTML = `
      <div style="font-family:'EB Garamond',serif; font-style:italic; font-size:5.5px; line-height:1.15; color:#141312; opacity:0.85; pointer-events:none;">
        <div style="white-space:nowrap; overflow:hidden;">lust, love & memories</div>
        <div style="white-space:nowrap; overflow:hidden; opacity:0.7;">a note sent...</div>
      </div>
      <div style="display:flex; justify-content:flex-end;">
        <span style="width:5px; height:5px; border-radius:50%; background:#8f2828; display:inline-block; box-shadow:0 1px 2px rgba(0,0,0,0.25);"></span>
      </div>
    `;
    stage.appendChild(paper);

    // Companion poetic letters swirling in the slipstream
    const COMPANION_CHARS = ['✦', 'm', '♥', 'L', 's'];
    const companionEls: { el: HTMLElement; lag: number; orbitX: number; orbitY: number }[] = [];

    if (!prefersReducedMotion) {
      COMPANION_CHARS.forEach((ch, idx) => {
        const cEl = document.createElement('span');
        cEl.textContent = ch;
        cEl.style.position = 'absolute';
        cEl.style.left = '0';
        cEl.style.top = '0';
        cEl.style.fontFamily = '"EB Garamond", serif';
        cEl.style.fontStyle = 'italic';
        cEl.style.fontSize = `${11 + (idx % 3) * 2}px`;
        cEl.style.color = '#141312';
        cEl.style.opacity = '0.75';
        cEl.style.pointerEvents = 'none';
        cEl.style.willChange = 'transform, opacity';
        stage.appendChild(cEl);
        companionEls.push({
          el: cEl,
          lag: 0.04 * (idx + 1),
          orbitX: (idx - 2) * 14,
          orbitY: ((idx % 2 === 0 ? 1 : -1) * 12) + (idx * 3)
        });
      });
    }

    document.body.appendChild(stage);

    // If reduced motion is preferred, perform a calm vertical fade
    if (prefersReducedMotion) {
      paper.style.transition = 'transform 1.2s ease-out, opacity 1.2s ease-out';
      paper.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(1)`;
      requestAnimationFrame(() => {
        paper.style.transform = `translate3d(${startX + 30}px, ${startY - 70}px, 0) scale(1.15)`;
        paper.style.opacity = '0';
      });
      setTimeout(() => {
        if (stage.parentNode) stage.parentNode.removeChild(stage);
      }, 1300);
      return;
    }

    // Full 3D Spiral and Escape trajectory
    const duration = 2500; // 2.5s duration
    const startTime = performance.now();
    const targetX = window.innerWidth + 80;

    function frame(now: number) {
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / duration);

      // Trajectory Math:
      // Horizontal progress with soft acceleration
      const px = Math.pow(p, 1.25);
      const baseX = startX + (targetX - startX) * px;

      // Vertical rise: gentle lift then buoyant upward swoop
      const baseY = startY - 180 * Math.sin(p * Math.PI * 0.85) - 140 * Math.pow(p, 1.8);

      // Spiral loop-de-loop between p=0.12 and p=0.72
      const spiralP = Math.min(1, Math.max(0, (p - 0.12) / 0.6));
      const spiralEnvelope = Math.sin(spiralP * Math.PI);
      const spiralTheta = p * 4 * Math.PI; // ~2 full spiral loops
      const radiusX = 46 * spiralEnvelope;
      const radiusY = 32 * spiralEnvelope;

      const posX = baseX + Math.cos(spiralTheta) * radiusX;
      const posY = baseY + Math.sin(spiralTheta) * radiusY;

      // Scale: starts at ~0.85 matching desk paper, scales to ~1.4 (natural letter scale)
      const scale = 0.85 + 0.55 * Math.sin(Math.min(1, p * 1.8) * Math.PI * 0.5);

      // 3D rotations: pitch, roll, and yaw as it catches the breeze
      const rotZ = Math.sin(spiralTheta) * 35 + p * 25;
      const rotX = Math.cos(spiralTheta) * 32;
      const rotY = Math.sin(spiralTheta * 0.7) * 45;

      paper.style.transform = `translate3d(${posX.toFixed(1)}px, ${posY.toFixed(1)}px, 0) scale(${scale.toFixed(2)}) rotateZ(${rotZ.toFixed(1)}deg) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg)`;

      // Companion letters lag and orbit behind the paper
      companionEls.forEach((item) => {
        const cP = Math.max(0, p - item.lag);
        const cPx = Math.pow(cP, 1.25);
        const cBaseX = startX + (targetX - startX) * cPx;
        const cBaseY = startY - 180 * Math.sin(cP * Math.PI * 0.85) - 140 * Math.pow(cP, 1.8);

        const cSpiralP = Math.min(1, Math.max(0, (cP - 0.12) / 0.6));
        const cEnv = Math.sin(cSpiralP * Math.PI);
        const cTheta = cP * 4 * Math.PI;

        const cX = cBaseX + Math.cos(cTheta) * (radiusX * cEnv * 0.85) + item.orbitX;
        const cY = cBaseY + Math.sin(cTheta) * (radiusY * cEnv * 0.85) + item.orbitY;
        const cOpacity = Math.max(0, 0.8 - p * 0.6);

        item.el.style.transform = `translate3d(${cX.toFixed(1)}px, ${cY.toFixed(1)}px, 0) rotate(${cTheta * 20}deg)`;
        item.el.style.opacity = cOpacity.toFixed(2);
      });

      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        if (stage.parentNode) {
          stage.parentNode.removeChild(stage);
        }
      }
    }

    requestAnimationFrame(frame);
  }

  cv.addEventListener('pointermove', onPointerMove);
  cv.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', setup);

  setup();

  return {
    destroy: () => {
      cv.removeEventListener('pointermove', onPointerMove);
      cv.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', setup);
    },
    sendNote: triggerFlyingNote
  };
}
