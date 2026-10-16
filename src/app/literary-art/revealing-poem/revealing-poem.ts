import { CuratedPoem } from './poems.data';
import { getDpr, NOOP } from '../common/math';

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

    // Scaled typography
    // Desktop: 41px, Tablet: 34px, Mobile: 27px
    const fontSize = W < 540 ? 27 : W < 768 ? 34 : 41;
    const lineHeight = Math.round(fontSize * 1.72);

    // Citation font size matching subheader
    const citationFontSize = W < 540 ? 18 : W < 768 ? 19 : 21;
    const citationLineHeight = Math.round(citationFontSize * 1.55);
    const citationSpacing = Math.round(fontSize * 1.25);

    // Standard literary attribution: "— [Title] · [Book]"
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

    // 2. Layout citation line(s) character-by-character
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
            color: '#8c827a' // warm sepia muted tone
          });
        }
        const w = wordWidths.at(wIdx) ?? 30;
        currentX += w + spaceW;
      });
    });

    isFullyRevealed = prefersReducedMotion;
    isFadingOut = false;
    draw(performance.now());
  }

  function advanceToNextPoem() {
    if (poemsList.length <= 1) return;
    currentPoemIdx = (currentPoemIdx + 1) % poemsList.length;
    layoutCurrentPoem();
  }

  function revealProximity(px: number, py: number, radius = 95) {
    if (prefersReducedMotion) return;
    let newlyTouched = false;

    chars.forEach((c) => {
      const charCenterX = c.x + c.w / 2;
      const charCenterY = c.y - c.fontSize * 0.32;
      const dx = px - charCenterX;
      const dy = py - charCenterY;
      const dist = Math.hypot(dx, dy);

      if (dist < radius) {
        const strength = 1 - dist / radius;
        c.targetReveal = Math.min(1, c.targetReveal + strength * 0.6);
        c.revealed = true;
        c.lastTouch = performance.now();
        newlyTouched = true;
      }
    });

    if (newlyTouched && !isFullyRevealed) {
      const revealedCount = chars.filter((c) => c.targetReveal >= 0.95).length;
      if (revealedCount / chars.length >= 0.88) {
        chars.forEach((c) => {
          c.targetReveal = 1;
          c.revealed = true;
        });
        isFullyRevealed = true;
        fullyRevealedTime = performance.now();
      }
    }
  }

  function draw(now: number) {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Global fade multiplier during cycle transition
    let globalFade = 1;
    if (isFadingOut) {
      const elapsed = (now - fadeStartTime) / 1000;
      globalFade = Math.max(0, 1 - elapsed / 0.8);
      if (globalFade <= 0) {
        advanceToNextPoem();
        return;
      }
    }

    let needsAnimation = false;

    // Check if fully revealed and held for 3.5 seconds
    if (isFullyRevealed && !isFadingOut && poemsList.length > 1) {
      if (now - fullyRevealedTime > 3500) {
        isFadingOut = true;
        fadeStartTime = now;
      }
      needsAnimation = true;
    }

    chars.forEach((c) => {
      // Smooth interpolation toward target reveal
      if (c.reveal < c.targetReveal) {
        c.reveal += (c.targetReveal - c.reveal) * 0.16;
        if (Math.abs(c.targetReveal - c.reveal) > 0.005) {
          needsAnimation = true;
        } else {
          c.reveal = c.targetReveal;
        }
      }

      const effectiveAlpha = c.reveal * globalFade;
      if (effectiveAlpha <= 0.001) return;

      ctx.save();
      ctx.globalAlpha = effectiveAlpha;
      ctx.fillStyle = c.color;

      // Regular for citation, italic for poetry
      const style = c.isAttribution ? 'normal' : 'italic';
      ctx.font = `${style} ${c.fontSize}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;

      ctx.fillText(c.ch, c.x, c.y);
      ctx.restore();
    });

    if (needsAnimation || ptr.on || isFadingOut) {
      start();
    }
  }

  function frame(now: number) {
    if (!on) {
      running = false;
      return;
    }
    draw(now);
    if (running) {
      animId = requestAnimationFrame(frame);
    }
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
      if (isVisible) {
        draw(performance.now());
      } else {
        running = false;
        cancelAnimationFrame(animId);
      }
    },
    { rootMargin: '100px' }
  );
  observer.observe(cv);

  const onPointerMove = (e: MouseEvent) => {
    const r = cv.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    ptr.x = px;
    ptr.y = py;
    ptr.on = true;

    // Brush stroke interpolation between previous pointer position and current
    if (ptr.px > -1e3) {
      const dist = Math.hypot(px - ptr.px, py - ptr.py);
      const steps = Math.max(1, Math.min(10, Math.ceil(dist / 14)));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        revealProximity(ptr.px + (px - ptr.px) * t, ptr.py + (py - ptr.py) * t, 90);
      }
    } else {
      revealProximity(px, py, 90);
    }

    ptr.px = px;
    ptr.py = py;
    start();
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
    const px = t.clientX - r.left;
    const py = t.clientY - r.top;
    revealProximity(px, py, 110);
    start();
  };

  cv.addEventListener('mousemove', onPointerMove, { passive: true });
  cv.addEventListener('mouseleave', onPointerLeave);
  cv.addEventListener('touchstart', onTouchMove, { passive: true });
  cv.addEventListener('touchmove', onTouchMove, { passive: true });
  cv.addEventListener('touchend', onPointerLeave);
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
