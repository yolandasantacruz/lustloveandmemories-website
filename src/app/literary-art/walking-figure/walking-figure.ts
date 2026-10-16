import { WALKER, getWalkerOps } from './walker.data';
import { drawOps } from '../morphing-shapes/shape-packer';
import { clamp, getDpr, NOOP } from '../common/math';

export interface WalkingFigureHandle {
  destroy: () => void;
  sendNote: () => void;
}

export function initWalkingFigure(
  cv: HTMLCanvasElement,
  containerEl: HTMLElement,
  prefersReducedMotion: boolean,
  color = '#141312'
): WalkingFigureHandle {
  const ctx = cv.getContext('2d');
  if (!ctx) {
    return { destroy: NOOP, sendNote: NOOP };
  }

  // Authentic, cohesive poetry from Yolanda Santa Cruz's published works
  const TEXT =
    'Whenever I want to write you, I write me. Some memories stay with you like shattered glass, making you bleed every time you stumble upon them. Softness is my soft spot, we were creating art. I will always make time for emotions, longing and desire, from the quiet ache of absence to the peace of beginning again... ';

  let W = 0;
  let H = 0;
  let dpr = 1;
  let currentScale = 1;
  let currentOx = 0;
  let currentOy = 0;
  let fs = 10;
  let lh = 12;

  // Precomputed walking frames (phoneAmt = 0: natural arm swing, no phone)
  let walkFrames: { ch: string; x: number; y: number }[][] = [];
  // Progressive arrival frames (phoneAmt = 0.0 -> 0.25 -> 0.50 -> 0.75 -> 1.0)
  let arrivalFrames: { ch: string; x: number; y: number }[][] = [];

  let currentFrameIndex = 0;
  let chars: { ch: string; x: number; y: number }[] = [];

  const ptr = { x: -1e4, y: -1e4 };
  let req = false;

  // Scroll walk cycle animation state
  let targetWalkPhase = 0;
  let currentWalkPhase = 0;
  let scrollAnimReq = false;

  // Progressive phone appearance: 0 when walking, 1 when arrived/stopped at destination
  let targetPhoneAmt = 1;
  let currentPhoneAmt = 1;



  let offscreenCanvas: HTMLCanvasElement | null = null;
  let offscreenCtx: CanvasRenderingContext2D | null = null;

  function generateCharsForOps(ops: (string | number)[][]): { ch: string; x: number; y: number }[] {
    if (!offscreenCanvas || !offscreenCtx || !ctx) return [];
    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    offscreenCtx.save();
    offscreenCtx.translate(currentOx, currentOy);
    offscreenCtx.scale(currentScale, currentScale);
    drawOps(offscreenCtx, ops);
    offscreenCtx.restore();

    const md = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height).data;
    const mWidth = offscreenCanvas.width;
    const mHeight = offscreenCanvas.height;

    const inside = (x: number, y: number) => {
      x |= 0;
      y |= 0;
      return x >= 0 && y >= 0 && x < mWidth && y < mHeight && (md.at((y * mWidth + x) * 4 + 3) ?? 0) > 120;
    };

    const figH = WALKER.h * currentScale;
    ctx.font = `italic ${fs}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;
    const result: { ch: string; x: number; y: number }[] = [];
    let k = 0;

    for (let y = currentOy + lh / 2; y < currentOy + figH; y += lh) {
      let x = currentOx;
      const endX = currentOx + WALKER.w * currentScale;
      while (x < endX) {
        const ch = TEXT.at(k % TEXT.length) ?? ' ';
        const w = ctx.measureText(ch).width || fs * 0.35;
        if (inside(x + w / 2, y)) {
          result.push({ ch, x, y });
          k++;
        }
        x += w;
      }
    }
    return result;
  }

  function setup() {
    if (typeof document === 'undefined') return;
    const r = cv.getBoundingClientRect();
    W = r.width;
    H = r.height;
    dpr = getDpr();
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);

    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = Math.ceil(W);
    offscreenCanvas.height = Math.ceil(H);
    offscreenCtx = offscreenCanvas.getContext('2d');
    if (!offscreenCtx) return;

    currentScale = Math.min(W / WALKER.w, H / WALKER.h);
    currentOx = (W - WALKER.w * currentScale) / 2;
    // Align bottom of figure's feet directly to the bottom baseline of the canvas
    currentOy = H - WALKER.h * currentScale;

    const figH = WALKER.h * currentScale;
    fs = Math.max(8, Math.min(13, figH / 17));
    lh = fs * 1.12;

    // 1. Precompute walking frames with arms swinging naturally (no phone visible while walking)
    walkFrames = [];
    for (let f = 0; f < 8; f++) {
      const phi = (f * Math.PI) / 4;
      walkFrames.push(generateCharsForOps(getWalkerOps(phi, 0)));
    }

    // 2. Precompute 8 progressive arrival frames so the phone raises softly and fluidly
    arrivalFrames = [];
    for (let a = 0; a <= 7; a++) {
      const amt = a / 7;
      arrivalFrames.push(generateCharsForOps(getWalkerOps(0, amt)));
    }

    currentFrameIndex = 0;
    // Initial display matches current phone state
    chars = currentPhoneAmt > 0.5 ? (arrivalFrames.at(7) ?? []) : (walkFrames.at(0) ?? []);
    draw();
  }

  function draw() {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.font = `italic ${fs}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;

    for (const c of chars) {
      const near = Math.hypot(c.x - ptr.x, c.y - ptr.y) < W * 0.35;
      ctx.globalAlpha = near ? 1 : 0.78;
      ctx.fillText(c.ch, c.x, c.y);
    }
    ctx.globalAlpha = 1;
  }

  function updateWalkCycle() {
    if (prefersReducedMotion) return;
    const diff = targetWalkPhase - currentWalkPhase;
    const phoneDiff = targetPhoneAmt - currentPhoneAmt;

    let needNextFrame = false;

    // 1. Walk phase easing (feet stepping!)
    if (Math.abs(diff) > 0.005) {
      currentWalkPhase += diff * 0.15;
      needNextFrame = true;

      const normalizedPhase = ((currentWalkPhase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const frameIdx = Math.floor(normalizedPhase / (Math.PI / 4)) % 8;

      if (frameIdx !== currentFrameIndex) {
        currentFrameIndex = frameIdx;
        // While walking, use the active walking frames
        if (currentPhoneAmt < 0.3) {
          chars = walkFrames.at(currentFrameIndex) ?? walkFrames.at(0) ?? [];
        }
      }
    } else {
      currentWalkPhase = targetWalkPhase;
    }

    // 2. Smooth progressive phone raising easing (when stopped at destination!)
    if (Math.abs(phoneDiff) > 0.01) {
      currentPhoneAmt += phoneDiff * 0.14;
      needNextFrame = true;
      if (currentPhoneAmt >= 0.3) {
        const arrivalIdx = Math.min(7, Math.max(0, Math.round(currentPhoneAmt * 7)));
        chars = arrivalFrames.at(arrivalIdx) ?? arrivalFrames.at(7) ?? [];
      } else {
        chars = walkFrames.at(currentFrameIndex) ?? walkFrames.at(0) ?? [];
      }
    } else {
      currentPhoneAmt = targetPhoneAmt;
      if (currentPhoneAmt >= 0.8) {
        chars = arrivalFrames.at(7) ?? [];
      } else if (currentPhoneAmt >= 0.3) {
        const arrivalIdx = Math.min(7, Math.max(0, Math.round(currentPhoneAmt * 7)));
        chars = arrivalFrames.at(arrivalIdx) ?? arrivalFrames.at(7) ?? [];
      } else {
        chars = walkFrames.at(currentFrameIndex) ?? walkFrames.at(0) ?? [];
      }
    }

    draw();

    if (needNextFrame) {
      requestAnimationFrame(updateWalkCycle);
    } else {
      scrollAnimReq = false;
    }
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

    // Active walking phase: from p = 0.0 to p = 0.85
    // Starts 50% closer to the form module (-85px to -110px),
    // and actively walks covering that distance to arrive centered (0px) in her column at p = 0.85!
    const travelDistance = Math.min(Math.max(window.innerWidth * 0.08, 75), 110);
    const walkProgress = clamp(p / 0.85);
    const walkX = (walkProgress - 1) * travelDistance;
    cv.style.setProperty('--walk', `${walkX.toFixed(1)}px`);

    // Advance walk cycle in direct sync with horizontal motion so feet keep stepping
    targetWalkPhase = walkProgress * Math.PI * 10;

    // Only once arrived at center (p >= 0.85) does the figure stop and progressively raise the phone!
    if (p >= 0.85) {
      targetPhoneAmt = clamp((p - 0.85) / 0.15); // Smooth 0 to 1 over final arrival
    } else {
      targetPhoneAmt = 0;
    }

    if (!scrollAnimReq) {
      scrollAnimReq = true;
      requestAnimationFrame(updateWalkCycle);
    }
  };

  // ─── EASTER EGG: UNDISTORTED TYPOGRAPHIC STREAM FROM PHONE ──────────────────
  function triggerLetterTrailFromPhone() {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    // Ensure figure is stably displaying the raised phone pose
    targetPhoneAmt = 1;
    currentPhoneAmt = 1;
    chars = arrivalFrames.at(7) ?? [];
    draw();

    const cvRect = cv.getBoundingClientRect();
    // Phone location on arrived WALKER silhouette: centered around x: 72, y: 38
    const startX = cvRect.left + currentOx + 72 * currentScale;
    const startY = cvRect.top + currentOy + 38 * currentScale;

    // Overlay stage for the letter stream
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

    // Typographic stream requested: "your message is being delivered • note sent"
    const STREAM = 'your message is being delivered • note sent';
    const items: { el: HTMLElement; delay: number; duration: number }[] = [];

    Array.from(STREAM).forEach((ch, idx) => {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.position = 'absolute';
      span.style.left = '0';
      span.style.top = '0';
      span.style.fontFamily = '"EB Garamond", Georgia, serif';
      span.style.fontStyle = 'italic';
      span.style.fontSize = '15px';
      span.style.fontWeight = '400';
      span.style.color = '#141312';
      span.style.opacity = '0';
      span.style.willChange = 'transform, opacity';
      stage.appendChild(span);

      items.push({
        el: span,
        delay: idx * 42, // Fluid stream spacing
        duration: 2200   // 2.2s gentle flight time across screen
      });
    });

    document.body.appendChild(stage);

    if (prefersReducedMotion) {
      items.forEach((item, i) => {
        setTimeout(() => {
          item.el.style.transition = 'transform 1.1s ease-out, opacity 1.1s ease-out';
          item.el.style.transform = `translate3d(${startX + i * 8}px, ${startY - 40}px, 0)`;
          item.el.style.opacity = '0.7';
          requestAnimationFrame(() => {
            item.el.style.transform = `translate3d(${startX + i * 12}px, ${startY - 90}px, 0)`;
            item.el.style.opacity = '0';
          });
        }, item.delay);
      });
      setTimeout(() => {
        if (stage.parentNode) stage.parentNode.removeChild(stage);
      }, 2500);
      return;
    }

    // Natural undulating breeze curve — ZERO scale distortion, ZERO rotation wobble
    const startTime = performance.now();
    const targetX = window.innerWidth + 90;
    const totalTime = (STREAM.length * 42) + 2200;

    function frame(now: number) {
      const elapsed = now - startTime;
      let activeCount = 0;

      items.forEach((item) => {
        const itemElapsed = elapsed - item.delay;
        if (itemElapsed <= 0) {
          item.el.style.opacity = '0';
          activeCount++;
          return;
        }

        const p = Math.min(1, itemElapsed / item.duration);
        if (p < 1) {
          activeCount++;
        }

        // Horizontal flight: smooth acceleration toward right screen edge
        const px = Math.pow(p, 1.15);
        const posX = startX + (targetX - startX) * px;

        // Vertical path: graceful buoyant rise with a soft undulating curve
        const posY = startY - 110 * Math.sin(p * Math.PI * 0.85) - 25 * p;

        // PURE translation — NO scale distortion, NO rotation wobble!
        item.el.style.transform = `translate3d(${posX.toFixed(1)}px, ${posY.toFixed(1)}px, 0)`;

        // Opacity: fade in cleanly from phone, stay solid, fade out as exiting screen
        let opacity = 1;
        if (p < 0.08) {
          opacity = p / 0.08;
        } else if (p > 0.85) {
          opacity = (1 - p) / 0.15;
        }
        item.el.style.opacity = Math.max(0, opacity).toFixed(2);
      });

      if (elapsed < totalTime && activeCount > 0) {
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
    sendNote: triggerLetterTrailFromPhone
  };
}
