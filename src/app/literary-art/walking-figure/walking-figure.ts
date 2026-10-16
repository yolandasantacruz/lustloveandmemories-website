import { WALKER } from './walker.data';
import { drawOps } from '../morphing-shapes/shape-packer';
import { clamp, getDpr, NOOP } from '../common/math';

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
    if (prefersReducedMotion || typeof window === 'undefined') return;
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
