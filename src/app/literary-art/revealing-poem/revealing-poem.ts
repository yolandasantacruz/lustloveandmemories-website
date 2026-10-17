import { CuratedPoem } from './poems.data';
import { clamp, getDpr, lerp, NOOP } from '../common/math';

/**
 * ─── Completion Pulsation Configuration ──────────────────────────────
 * Dual-pulse breath effect (internal color brightening + external halo)
 * that pulses when the verse is fully uncovered.
 */
export const POEM_PULSE_CONFIG = {
  /** Number of times the glow pulses */
  pulseCount: 1,

  /** Duration (in ms) of each individual pulse */
  singlePulseDurationMs: 1200,

  /** Delay (in ms) after the last letter is uncovered before pulsing begins */
  startDelayMs: 100,

  /**
   * Internal Glow: whether the text fill brightens during the pulse.
   * Set to false to keep ink at resting deep black (#141312).
   */
  enableInternalGlow: false,

  /**
   * Internal Glow Color:
   * 🎨 Click the color box in your editor to open the visual color picker!
   */
  internalColor: '#535353ff',

  /**
   * External Letter Glow: soft, ethereal glow radiating directly out of each letter.
   */
  enableExternalGlow: false,

  externalGlow: {
    /** 🎨 Click the color box in your editor to open the visual color picker! */
    color: '#ebe6e6ff',
    blurPx: 30,
    maxOpacity: 1
  },

  /**
   * Sunlight Reflection: specular sheen that sweeps left-to-right across the letters.
   */
  sunReflection: {
    /** Toggle the sun sweep on/off */
    enabled: true,

    /** Delay (in ms) after poem is revealed before sun sweep begins when glow is off (default: 500ms = half a second) */
    startDelayMs: 10,

    /** Delay (in ms) after glow finishes before sun sweep begins (used when glow is enabled) */
    delayAfterGlowMs: 50,

    /** Duration (in ms) for the light to sweep across the text — adjust to make it faster or slower! */
    durationMs: 1300,

    /**
     * Peak color of the reflection as it glances across each letter.
     * 🎨 Click the color box in your editor to open the visual color picker!
     */
    color: '#7c7a78ff',

    /** Width of the light reflection band (ratio of poem width, default: 0.25) */
    bandWidthRatio: 0.25,

    /** Diagonal tilt angle (~12° slant like light catching tilted paper) */
    tilt: 0.6
  },

  /** Delay (in ms) before the attribution line blooms after completion */
  attributionDelayMs: 1000
};

/**
 * ─── Parchment Ink Watermark Configuration ──────────────────────────
 * Delicate literary watermark (ink wash / splatter) marking the
 * poetic space on the blank parchment before letters are uncovered.
 */
export const POEM_WATERMARK_CONFIG = {
  /** Toggle the ink watermark on/off */
  enabled: true,

  /**
   * Resting opacity of the watermark on the paper (0.01 to 0.20).
   * 0.048 is 25% lower than 0.065 for gentle, sophisticated contrast.
   */
  opacity: 0.03,

  /**
   * Whether the watermark softly dims when the user uncovers the poem,
   * keeping the focus purely on the dark ink typography.
   */
  dimOnReveal: true,

  /**
   * Opacity of the watermark once the poem is fully uncovered (if dimOnReveal is true).
   */
  revealedOpacity: 0.024,

  /**
   * Optical vertical nudge in pixels (positive moves down, negative moves up).
   * Default: 12px down to visually balance the ink splatter core across both poem and title.
   */
  offsetY: 12
};

function parseColorToRgb(colorStr: string): { r: number; g: number; b: number } {
  const str = colorStr.trim();
  if (str.startsWith('#')) {
    let c = str.substring(1);
    if (c.length === 3) {
      c = c.split('').map((x) => x + x).join('');
    }
    const num = parseInt(c.substring(0, 6), 16);
    if (!Number.isNaN(num)) {
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
      };
    }
  }
  const rgbMatch = str.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch.at(1) ?? '90', 10),
      g: parseInt(rgbMatch.at(2) ?? '85', 10),
      b: parseInt(rgbMatch.at(3) ?? '80', 10)
    };
  }
  return { r: 90, g: 85, b: 80 };
}

function getBookSlug(bookTitle: string): string {
  if (bookTitle.toLowerCase().includes('longest')) {
    return 'the-longest-nights';
  }
  return 'lust-love-and-memories';
}

function getEffectiveAttributionDelay(): number {
  const isGlowActive = POEM_PULSE_CONFIG.enableInternalGlow || POEM_PULSE_CONFIG.enableExternalGlow;
  const totalPulseMs = isGlowActive ? POEM_PULSE_CONFIG.singlePulseDurationMs * POEM_PULSE_CONFIG.pulseCount : 0;
  const glowEndMs = isGlowActive ? POEM_PULSE_CONFIG.startDelayMs + totalPulseMs : 0;

  const sunCfg = POEM_PULSE_CONFIG.sunReflection;
  const sunStartMs = isGlowActive
    ? glowEndMs + sunCfg.delayAfterGlowMs
    : sunCfg.startDelayMs;
  const sunEndMs = sunStartMs + sunCfg.durationMs;

  return Math.max(
    POEM_PULSE_CONFIG.attributionDelayMs,
    sunCfg.enabled ? sunEndMs + 250 : glowEndMs + 250
  );
}

function getTapBatch(lineIdx: number, totalLines: number, totalTaps: number): number {
  if (totalLines <= 1 || totalTaps <= 1) return 0;
  if (totalLines === 2 && totalTaps === 2) {
    return lineIdx === 0 ? 0 : 1;
  }
  if (totalLines === 3 && totalTaps === 3) {
    return lineIdx;
  }
  if (totalLines === 4 && totalTaps === 3) {
    // 4-line poem in 3 taps:
    // Line 1 & Line 2 -> Tap 1 (batch 0)
    // Line 3 -> Tap 2 (batch 1)
    // Line 4 -> Tap 3 (batch 2)
    return lineIdx <= 1 ? 0 : lineIdx - 1;
  }
  return Math.min(totalTaps - 1, Math.floor((lineIdx * totalTaps) / totalLines));
}

export function initRevealingPoem(
  cv: HTMLCanvasElement,
  stanzasOrPoems: CuratedPoem[] | string[][] | string[],
  prefersReducedMotion: boolean,
  color = '#141312',
  onNavigate?: (url: string) => void
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
    isBookTitle?: boolean;
    fontSize: number;
    color: string;
    opacity?: number;
    tapBatch?: number;
  }

  interface BookLinkBounds {
    x: number;
    y: number;
    w: number;
    h: number;
    underlineStartX: number;
    underlineEndX: number;
    underlineY: number;
    slug: string;
  }

  let W = 0;
  let H = 0;
  let dpr = 1;
  let chars: CharGlyph[] = [];
  let bookBounds: BookLinkBounds | null = null;
  let colorProgress = 0;
  let rawLineProgress = 0;
  let lastDrawTime = performance.now();
  let on = false;
  let running = false;
  let animId = 0;

  let currentPoemIdx = 0;
  let lastLayoutPoemIdx = -1;
  let tapRevealStep = 0;
  let isFullyRevealed = false;
  let fullyRevealedTime = 0;
  let isFadingOut = false;
  let fadeStartTime = 0;
  let hasStarted = false;
  let lastActivityTime = performance.now();
  let verseBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  const watermarkEl = cv.parentElement?.querySelector<HTMLElement>('.poem-watermark');

  let isTouchPointer = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let touchMovedDistance = 0;
  let lastTouchHandledTime = 0;

  const ptr = { x: -1e4, y: -1e4, px: -1e4, py: -1e4, on: false, hoverBook: false };

  function layoutCurrentPoem() {
    const r = cv.getBoundingClientRect();
    W = r.width;
    H = r.height;
    dpr = getDpr();
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);

    const activePoem = poemsList.at(currentPoemIdx) ?? poemsList.at(0);
    if (!activePoem) return;

    // Scaled typography (+20% size)
    // Desktop: 41px, Tablet: 34px, Mobile: 27px
    const fontSize = W < 540 ? 27 : W < 768 ? 34 : 41;
    const lineHeight = Math.round(fontSize * 1.72);

    const isNewPoem = currentPoemIdx !== lastLayoutPoemIdx;
    lastLayoutPoemIdx = currentPoemIdx;
    if (isNewPoem) {
      tapRevealStep = 0;
      isFullyRevealed = prefersReducedMotion;
      fullyRevealedTime = 0;
      isFadingOut = false;
      hasStarted = false;
    }

    const numPoemLines = activePoem.lines.length;
    const totalTapsRequired = numPoemLines <= 2 ? 2 : 3;

    // Natural responsive word wrapping to prevent text clipping at any screen width
    ctx!.font = `italic ${fontSize}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;
    const maxVerseWidth = Math.max(260, W - 48);

    interface VerseLineItem {
      text: string;
      originalLineIdx: number;
    }
    const verseLines: VerseLineItem[] = [];
    activePoem.lines.forEach((line, originalLineIdx) => {
      const words = line.split(' ');
      let currentLine = '';
      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testW = ctx!.measureText(testLine).width;
        if (testW > maxVerseWidth && currentLine) {
          verseLines.push({ text: currentLine, originalLineIdx });
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) {
        verseLines.push({ text: currentLine, originalLineIdx });
      }
    });

    // Citation font size matching subheader ("Move your mouse over to uncover the letters.") exactly:
    // .sec-desc = clamp(1rem, 0.95rem + 0.25vw, 1.18rem) -> Desktop: 21px, Tablet: 19px, Mobile: 18px
    const citationFontSize = W < 540 ? 18 : W < 768 ? 19 : 21;
    const citationLineHeight = Math.round(citationFontSize * 1.55);
    // Citation spacing increased by 20% (+20% optical breath between poem verse and title attribution)
    const citationSpacing = Math.round(fontSize * 1.5);

    // Clean literary attribution (regular, not italic): "[Title] · [Book]"
    ctx!.font = `normal ${citationFontSize}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;
    const spaceW = Math.max(ctx!.measureText(' ').width, Math.round(citationFontSize * 0.32));
    const dividerSpace = Math.max(spaceW, Math.round(citationFontSize * 0.7)); // Optical 0.9rem equivalent (~15px desktop, ~13px mobile)

    const titleWidth = ctx!.measureText(activePoem.title).width;
    const dividerWidth = ctx!.measureText('·').width;
    const bookWidth = ctx!.measureText(activePoem.book).width;
    const singleWidth = titleWidth + dividerWidth + bookWidth + 2 * dividerSpace;
    const maxCitationWidth = Math.max(120, W - 48);

    const citationLines =
      singleWidth <= maxCitationWidth
        ? [`${activePoem.title} · ${activePoem.book}`]
        : [activePoem.title, activePoem.book];

    const totalVerseHeight = (verseLines.length - 1) * lineHeight;
    const totalCitationHeight = (citationLines.length - 1) * citationLineHeight;
    const totalBlockHeight = totalVerseHeight + citationSpacing + totalCitationHeight;

    const startY = Math.max(30, Math.round((H - totalBlockHeight) / 2 + fontSize * 0.72));

    chars = [];
    const bookChars: CharGlyph[] = [];

    // 1. Layout verse lines character-by-character
    verseLines.forEach((lineItem, lineIdx) => {
      ctx!.font = `italic ${fontSize}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;
      const lineWords = lineItem.text.split(' ');
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

      const tapBatch = getTapBatch(lineItem.originalLineIdx, numPoemLines, totalTapsRequired);
      const isAlreadyRevealedOnResize =
        !isNewPoem && (isFullyRevealed || (tapRevealStep > 0 && tapBatch < tapRevealStep));

      lineWords.forEach((word, wIdx) => {
        const len = word.length;
        for (let i = 0; i < len; i++) {
          const ch = word.charAt(i);
          const leftAdv = i === 0 ? 0 : ctx!.measureText(word.substring(0, i)).width;
          const rightAdv = ctx!.measureText(word.substring(0, i + 1)).width;
          const charW = Math.max(rightAdv - leftAdv, ctx!.measureText(ch).width);

          const shouldBeRevealed = prefersReducedMotion || isAlreadyRevealedOnResize;

          chars.push({
            ch,
            x: currentX + leftAdv,
            y,
            w: charW,
            reveal: shouldBeRevealed ? 1 : 0,
            targetReveal: shouldBeRevealed ? 1 : 0,
            revealed: shouldBeRevealed,
            lastTouch: 0,
            isAttribution: false,
            fontSize,
            color,
            tapBatch
          });
        }
        const w = wordWidths.at(wIdx) ?? 40;
        currentX += w + spaceW;
      });
    });

    // Precalculate verse bounding box for completion animations
    let vMinX = Infinity;
    let vMaxX = -Infinity;
    let vMinY = Infinity;
    let vMaxY = -Infinity;
    for (const c of chars) {
      if (!c.isAttribution) {
        if (c.x < vMinX) vMinX = c.x;
        if (c.x + c.w > vMaxX) vMaxX = c.x + c.w;
        if (c.y - c.fontSize < vMinY) vMinY = c.y - c.fontSize;
        if (c.y + c.fontSize * 0.3 > vMaxY) vMaxY = c.y + c.fontSize * 0.3;
      }
    }
    verseBounds = {
      minX: Number.isFinite(vMinX) ? vMinX : 0,
      maxX: Number.isFinite(vMaxX) ? vMaxX : W,
      minY: Number.isFinite(vMinY) ? vMinY : 0,
      maxY: Number.isFinite(vMaxY) ? vMaxY : H
    };

    // 2. Layout citation line(s) character-by-character (Regular font, matching .sec-desc size and var(--ink-muted) #78716c)
    citationLines.forEach((cLine, cIdx) => {
      ctx!.font = `normal ${citationFontSize}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;
      const cWords = cLine.split(' ');

      const getSpacingAfter = (wIdx: number): number => {
        if (wIdx >= cWords.length - 1) return 0;
        const currentIsDivider = cWords.at(wIdx) === '·';
        const nextIsDivider = cWords.at(wIdx + 1) === '·';
        return (currentIsDivider || nextIsDivider) ? dividerSpace : spaceW;
      };

      let totalLineWidth = 0;
      const wordWidths = cWords.map((w, wIdx) => {
        const mw = ctx!.measureText(w).width;
        totalLineWidth += mw + getSpacingAfter(wIdx);
        return mw;
      });

      let currentX = Math.max(16, Math.round((W - totalLineWidth) / 2));
      const y = startY + (verseLines.length - 1) * lineHeight + citationSpacing + cIdx * citationLineHeight;

      let inBookPart = citationLines.length > 1 ? cIdx === 1 : false;

      cWords.forEach((word, wIdx) => {
        if (citationLines.length === 1 && word === '·') {
          inBookPart = true;
        }

        const isDivider = word === '·';
        const isCurrentWordBook = inBookPart && !isDivider;

        const len = word.length;
        for (let i = 0; i < len; i++) {
          const ch = word.charAt(i);
          const leftAdv = i === 0 ? 0 : ctx!.measureText(word.substring(0, i)).width;
          const rightAdv = ctx!.measureText(word.substring(0, i + 1)).width;
          const charW = Math.max(rightAdv - leftAdv, ctx!.measureText(ch).width);

          const charObj: CharGlyph = {
            ch,
            x: currentX + leftAdv,
            y,
            w: charW,
            reveal: prefersReducedMotion ? 1 : 0,
            targetReveal: prefersReducedMotion ? 1 : 0,
            revealed: prefersReducedMotion,
            lastTouch: 0,
            isAttribution: true,
            isBookTitle: isCurrentWordBook,
            fontSize: citationFontSize,
            color: '#78716c',
            opacity: isDivider ? 0.5 : 1.0
          };
          chars.push(charObj);
          if (isCurrentWordBook) {
            bookChars.push(charObj);
          }
        }
        const w = wordWidths.at(wIdx) ?? 28;
        currentX += w + getSpacingAfter(wIdx);
      });
    });

    if (bookChars.length > 0) {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      let baselineY = 0;

      for (const bc of bookChars) {
        if (bc.x < minX) minX = bc.x;
        if (bc.x + bc.w > maxX) maxX = bc.x + bc.w;
        if (bc.y - bc.fontSize * 0.9 < minY) minY = bc.y - bc.fontSize * 0.9;
        if (bc.y + bc.fontSize * 0.35 > maxY) maxY = bc.y + bc.fontSize * 0.35;
        baselineY = bc.y;
      }

      const underlineOffset = Math.round(citationFontSize * 0.32) + 2;
      bookBounds = {
        x: minX - 6,
        y: minY - 4,
        w: maxX - minX + 12,
        h: maxY - minY + 8 + underlineOffset,
        underlineStartX: minX,
        underlineEndX: maxX,
        underlineY: baselineY + underlineOffset,
        slug: getBookSlug(activePoem.book)
      };
    } else {
      bookBounds = null;
    }

    ptr.hoverBook = false;
    colorProgress = 0;
    rawLineProgress = 0;
    cv.style.cursor = '';
    if (isNewPoem) {
      isFullyRevealed = prefersReducedMotion;
      fullyRevealedTime = 0;
      isFadingOut = false;
      hasStarted = false;
    }

    // Calculate total content bounds (verse + attribution line) so watermark centers across entirety of content
    let cMinX = Infinity, cMaxX = -Infinity;
    let cMinY = Infinity, cMaxY = -Infinity;
    for (const c of chars) {
      if (c.x < cMinX) cMinX = c.x;
      if (c.x + c.w > cMaxX) cMaxX = c.x + c.w;
      if (c.y - c.fontSize < cMinY) cMinY = c.y - c.fontSize;
      if (c.y + c.fontSize * 0.35 > cMaxY) cMaxY = c.y + c.fontSize * 0.35;
    }

    if (watermarkEl && Number.isFinite(cMinX) && Number.isFinite(cMaxX)) {
      const centerX = (cMinX + cMaxX) / 2;
      const centerY = (cMinY + cMaxY) / 2 + (POEM_WATERMARK_CONFIG.offsetY ?? 0);
      watermarkEl.style.left = `${Math.round(centerX)}px`;
      watermarkEl.style.top = `${Math.round(centerY)}px`;
    }

    draw(performance.now());
  }

  function draw(now: number) {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textBaseline = 'alphabetic';

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

    // Sync Ink Splatter Watermark opacity with reveal state (overflowing DOM element)
    if (watermarkEl && POEM_WATERMARK_CONFIG.enabled) {
      let currentOpacity = POEM_WATERMARK_CONFIG.opacity;
      if (POEM_WATERMARK_CONFIG.dimOnReveal && hasStarted) {
        const verseChars = chars.filter((c) => !c.isAttribution && c.ch.trim().length > 0);
        const revealedCount = verseChars.filter((c) => c.revealed).length;
        const totalCount = Math.max(1, verseChars.length);
        const revealProgress = Math.min(1, revealedCount / totalCount);
        currentOpacity = lerp(
          POEM_WATERMARK_CONFIG.opacity,
          POEM_WATERMARK_CONFIG.revealedOpacity,
          revealProgress
        );
      }
      const finalAlpha = currentOpacity * fadeMultiplier;
      watermarkEl.style.opacity = finalAlpha.toFixed(4);
    }

    // Precise letter-by-letter quill uncover (desktop mouse / pointer hover)
    if (!prefersReducedMotion && ptr.on && !isFadingOut && !isTouchPointer) {
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

    // Timing calculations for completion celebration
    const completionElapsed = isFullyRevealed && fullyRevealedTime > 0 ? now - fullyRevealedTime : -1;
    const isGlowActive = POEM_PULSE_CONFIG.enableInternalGlow || POEM_PULSE_CONFIG.enableExternalGlow;
    const totalPulseMs = isGlowActive ? POEM_PULSE_CONFIG.singlePulseDurationMs * POEM_PULSE_CONFIG.pulseCount : 0;
    const glowEndMs = isGlowActive ? POEM_PULSE_CONFIG.startDelayMs + totalPulseMs : 0;

    const sunCfg = POEM_PULSE_CONFIG.sunReflection;
    // When glow is active, starts after glow completes + delayAfterGlowMs.
    // When glow is off, starts directly after startDelayMs (default: 500ms = half a second)!
    const sunStartMs = isGlowActive
      ? glowEndMs + sunCfg.delayAfterGlowMs
      : sunCfg.startDelayMs;
    const sunEndMs = sunStartMs + sunCfg.durationMs;

    // Effective attribution delay: ensure it blooms after both glow and sun sweep complete
    const effectiveAttributionDelay = getEffectiveAttributionDelay();

    // Delay after poem is uncovered before fading in the attribution line (title + book)
    if (isFullyRevealed && !isFadingOut && fullyRevealedTime > 0) {
      if (now - fullyRevealedTime >= effectiveAttributionDelay) {
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

    const delta = Math.min(32, Math.max(1, now - lastDrawTime));
    lastDrawTime = now;

    const isAttributionVisible =
      prefersReducedMotion ||
      (isFullyRevealed &&
        fullyRevealedTime > 0 &&
        now - fullyRevealedTime >= effectiveAttributionDelay &&
        !isFadingOut);

    const isTargetHovered = isAttributionVisible && ptr.hoverBook;

    // Color transition: gentle slow fade (~420ms duration)
    const colorSpeed = delta / 420;
    if (isTargetHovered) {
      colorProgress = Math.min(1, colorProgress + colorSpeed);
    } else {
      colorProgress = Math.max(0, colorProgress - colorSpeed);
    }

    // Line transition: left-to-right expansion (~580ms duration with cubic ease-out)
    const lineSpeed = delta / 580;
    if (isTargetHovered) {
      rawLineProgress = Math.min(1, rawLineProgress + lineSpeed);
    } else {
      rawLineProgress = Math.max(0, rawLineProgress - lineSpeed * 1.1);
    }

    // Cubic ease-out curve matching site-nav a::after: f(t) = 1 - (1 - t)^3
    const lineProgress = 1 - Math.pow(1 - rawLineProgress, 3);

    // Completion Pulsation (Internal color brightening + external halo breathing)
    let pulseIntensity = 0;
    if (
      !prefersReducedMotion &&
      !isFadingOut &&
      isFullyRevealed &&
      isGlowActive &&
      completionElapsed >= POEM_PULSE_CONFIG.startDelayMs &&
      completionElapsed < glowEndMs
    ) {
      const elapsedInPulses = completionElapsed - POEM_PULSE_CONFIG.startDelayMs;
      const cycleT =
        (elapsedInPulses % POEM_PULSE_CONFIG.singlePulseDurationMs) /
        POEM_PULSE_CONFIG.singlePulseDurationMs;
      // Smooth cosine ease-in-out curve: perfectly continuous start, peak, and fade out
      pulseIntensity = 0.5 - 0.5 * Math.cos(cycleT * 2 * Math.PI);
    }

    // Sunlight Reflection (Sweeps left-to-right across letters AFTER the glow finishes)
    let flashX = -9999;
    let flashBand = 0;
    const isSunSweeping =
      !prefersReducedMotion &&
      !isFadingOut &&
      isFullyRevealed &&
      sunCfg.enabled &&
      completionElapsed >= sunStartMs &&
      completionElapsed <= sunEndMs;

    if (isSunSweeping) {
      flashBand = Math.max(75, Math.min(130, (verseBounds.maxX - verseBounds.minX) * sunCfg.bandWidthRatio));
      const tFlash = (completionElapsed - sunStartMs) / sunCfg.durationMs;
      // Smooth ease across the page
      const easeFlash = tFlash < 0.5 ? 2 * tFlash * tFlash : 1 - Math.pow(-2 * tFlash + 2, 2) / 2;
      const totalSpan = (verseBounds.maxX - verseBounds.minX) + flashBand * 2 + 80;
      flashX = verseBounds.minX - flashBand - 40 + totalSpan * easeFlash;
    }



    // Render characters
    for (const c of chars) {
      if (!prefersReducedMotion) {
        if (c.isAttribution) {
          if (!isFullyRevealed || fullyRevealedTime <= 0) {
            c.reveal = 0;
          } else {
            // Smooth literary fade-in after the attribution delay
            const elapsed = (now - fullyRevealedTime) - effectiveAttributionDelay;
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

      const alpha = c.reveal * fadeMultiplier * (c.opacity ?? 1);
      if (alpha <= 0.005) continue;

      ctx.save();
      const fontStyle = c.isAttribution ? 'normal' : 'italic';
      ctx.font = `${fontStyle} ${c.fontSize}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;

      let charColor = c.color ?? color;
      if (!c.isAttribution && pulseIntensity > 0.005) {
        if (POEM_PULSE_CONFIG.enableInternalGlow) {
          // Internal glow: text fill subtly brightens to a lighter shade
          const intRgb = parseColorToRgb(POEM_PULSE_CONFIG.internalColor);
          const r = Math.round(20 + (intRgb.r - 20) * pulseIntensity);
          const g = Math.round(19 + (intRgb.g - 19) * pulseIntensity);
          const b = Math.round(18 + (intRgb.b - 18) * pulseIntensity);
          charColor = `rgb(${r}, ${g}, ${b})`;
        }

        // External glow: direct multi-tier Gaussian bloom emanating from each letterform
        const { color: glowColorStr, blurPx, maxOpacity } = POEM_PULSE_CONFIG.externalGlow;
        const glowAlpha = clamp(pulseIntensity * maxOpacity * alpha, 0, 1);
        if (POEM_PULSE_CONFIG.enableExternalGlow && glowAlpha > 0.01) {
          const { r: gr, g: gg, b: gb } = parseColorToRgb(glowColorStr);
          ctx.save();
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.fillStyle = charColor;
          ctx.globalAlpha = clamp(alpha, 0, 1);

          // Tier 1: Wide ethereal bloom feathering out into the paper
          ctx.shadowColor = `rgba(${gr}, ${gg}, ${gb}, ${(glowAlpha * 0.6).toFixed(3)})`;
          ctx.shadowBlur = blurPx;
          ctx.fillText(c.ch, c.x, c.y);

          // Tier 2: Rich, dense core halo hugging the curves and serifs of the letter
          ctx.shadowColor = `rgba(${gr}, ${gg}, ${gb}, ${glowAlpha.toFixed(3)})`;
          ctx.shadowBlur = Math.max(2, Math.round(blurPx * 0.4));
          ctx.fillText(c.ch, c.x, c.y);

          ctx.restore();
        }
      }

      // Sunlight Reflection: specular sheen sweeping left-to-right across the text AFTER glow finishes
      if (!c.isAttribution && isSunSweeping && flashX > -9000) {
        const charEffectiveX = (c.x + c.w / 2) + (c.y - verseBounds.minY) * sunCfg.tilt;
        const dist = Math.abs(charEffectiveX - flashX);
        if (dist < flashBand) {
          const flashIntensity = Math.pow(1 - dist / flashBand, 1.8);
          const sunRgb = parseColorToRgb(sunCfg.color);
          const r = Math.round(20 + (sunRgb.r - 20) * flashIntensity);
          const g = Math.round(19 + (sunRgb.g - 19) * flashIntensity);
          const b = Math.round(18 + (sunRgb.b - 18) * flashIntensity);
          charColor = `rgb(${r}, ${g}, ${b})`;
        }
      }

      if (c.isBookTitle && colorProgress > 0.005) {
        // Smooth ease-out for color fade
        const easeColor = colorProgress * (2 - colorProgress);
        // Fade from #78716c (rgb 120, 113, 108) to #141312 (rgb 20, 19, 18)
        const r = Math.round(120 + (20 - 120) * easeColor);
        const g = Math.round(113 + (19 - 113) * easeColor);
        const b = Math.round(108 + (18 - 108) * easeColor);
        charColor = `rgb(${r}, ${g}, ${b})`;
      }

      ctx.fillStyle = charColor;
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.fillText(c.ch, c.x, c.y);
      ctx.restore();
    }

    // Elegant left-to-right underline expanding beneath the book title (matching top nav bar)
    if (lineProgress > 0.005 && bookBounds && isAttributionVisible && fadeMultiplier > 0) {
      const totalWidth = bookBounds.underlineEndX - bookBounds.underlineStartX;
      const currentWidth = totalWidth * lineProgress;
      const uAlpha = clamp(fadeMultiplier, 0, 1);

      ctx.save();
      ctx.strokeStyle = `rgba(20, 19, 18, ${uAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const lineY = Math.round(bookBounds.underlineY) + 0.5;
      ctx.moveTo(bookBounds.underlineStartX, lineY);
      ctx.lineTo(bookBounds.underlineStartX + currentWidth, lineY);
      ctx.stroke();
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
      } else {
        running = false;
        cancelAnimationFrame(animId);
      }
    },
    { threshold: 0.1 }
  );
  observer.observe(cv);

  function isTouchOnlyDevice(): boolean {
    const win = cv.ownerDocument?.defaultView;
    if (win?.matchMedia) {
      return win.matchMedia('(hover: none) and (pointer: coarse)').matches;
    }
    return false;
  }

  function advanceMobileReveal() {
    if (isFullyRevealed || isFadingOut) return;

    tapRevealStep++;
    hasStarted = true;
    lastActivityTime = performance.now();

    const activePoem = poemsList.at(currentPoemIdx) ?? poemsList.at(0);
    const numPoemLines = activePoem?.lines.length ?? 3;
    const totalTapsRequired = numPoemLines <= 2 ? 2 : 3;

    const currentBatchThreshold = tapRevealStep - 1;

    for (const c of chars) {
      if (c.isAttribution) continue;
      if (c.tapBatch !== undefined && c.tapBatch <= currentBatchThreshold) {
        c.targetReveal = 1.0;
        c.revealed = true;
        c.lastTouch = performance.now();
      }
    }

    if (tapRevealStep >= totalTapsRequired) {
      for (const c of chars) {
        if (!c.isAttribution) {
          c.targetReveal = 1.0;
          c.revealed = true;
          c.lastTouch = performance.now();
        }
      }
    }

    if (!running && !prefersReducedMotion) {
      running = true;
      animId = requestAnimationFrame(frame);
    }
  }

  function handleCanvasInteraction(px: number, py: number, isTouchAction: boolean) {
    const now = performance.now();
    const effectiveDelay = getEffectiveAttributionDelay();
    const isAttributionVisible =
      prefersReducedMotion ||
      (isFullyRevealed && fullyRevealedTime > 0 && now - fullyRevealedTime >= effectiveDelay && !isFadingOut);

    // 1. Clicked or tapped on the book title link
    if (isAttributionVisible && bookBounds) {
      const isOverBook =
        px >= bookBounds.x &&
        px <= bookBounds.x + bookBounds.w &&
        py >= bookBounds.y &&
        py <= bookBounds.y + bookBounds.h;

      if (isOverBook) {
        const targetUrl = '#works';
        if (onNavigate) {
          onNavigate(targetUrl);
        } else {
          const doc = cv.ownerDocument;
          const el = doc?.getElementById('works');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }
    }

    // 2. If already fully revealed and user taps outside book link after 2s, cycle forward smoothly
    if (isFullyRevealed && !isFadingOut && fullyRevealedTime > 0 && now - fullyRevealedTime > 2000) {
      isFadingOut = true;
      fadeStartTime = now;
      if (!running && !prefersReducedMotion) {
        running = true;
        animId = requestAnimationFrame(frame);
      }
      return;
    }

    // 3. If poem not yet fully revealed, advance reveal on touch interaction or touch-only devices
    if (!isFullyRevealed && !isFadingOut) {
      if (isTouchAction || isTouchOnlyDevice()) {
        advanceMobileReveal();
      }
    }
  }

  const onPointerMove = (e: MouseEvent) => {
    isTouchPointer = false;
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

    // Check if hovering over the clickable book title link
    const now = performance.now();
    const effectiveDelay = getEffectiveAttributionDelay();
    const isAttributionVisible =
      prefersReducedMotion ||
      (isFullyRevealed && fullyRevealedTime > 0 && now - fullyRevealedTime >= effectiveDelay && !isFadingOut);

    if (isAttributionVisible && bookBounds) {
      const isOverBook =
        nx >= bookBounds.x &&
        nx <= bookBounds.x + bookBounds.w &&
        ny >= bookBounds.y &&
        ny <= bookBounds.y + bookBounds.h;

      if (isOverBook !== ptr.hoverBook) {
        ptr.hoverBook = isOverBook;
        cv.style.cursor = isOverBook ? 'pointer' : '';
      }
    } else if (ptr.hoverBook) {
      ptr.hoverBook = false;
      cv.style.cursor = '';
    }

    if (!running && !prefersReducedMotion) {
      running = true;
      animId = requestAnimationFrame(frame);
    }
  };

  const onPointerLeave = () => {
    ptr.on = false;
    ptr.px = -1e4;
    ptr.py = -1e4;
    if (ptr.hoverBook) {
      ptr.hoverBook = false;
      cv.style.cursor = '';
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    isTouchPointer = true;
    if (e.touches.length !== 1) return;
    const t = e.touches.item(0);
    if (!t) return;
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchStartTime = performance.now();
    touchMovedDistance = 0;
  };

  const onTouchMove = (e: TouchEvent) => {
    isTouchPointer = true;
    if (!e.touches.length) return;
    const t = e.touches.item(0);
    if (!t) return;
    const dist = Math.hypot(t.clientX - touchStartX, t.clientY - touchStartY);
    if (dist > touchMovedDistance) {
      touchMovedDistance = dist;
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    const now = performance.now();
    const duration = now - touchStartTime;
    const r = cv.getBoundingClientRect();
    const tapX = touchStartX - r.left;
    const tapY = touchStartY - r.top;

    if (tapX < 0 || tapX > r.width || tapY < 0 || tapY > r.height) {
      return;
    }

    const isTap = touchMovedDistance < 16 && duration < 500;
    const t = e.changedTouches?.item(0);
    const isHorizontalSwipe =
      t !== null &&
      t !== undefined &&
      Math.abs(t.clientX - touchStartX) > 35 &&
      Math.abs(t.clientY - touchStartY) < 40 &&
      duration < 500;

    if (isTap || isHorizontalSwipe) {
      lastTouchHandledTime = now;
      handleCanvasInteraction(tapX, tapY, true);
    }
  };

  const onClick = (e: MouseEvent) => {
    const now = performance.now();
    if (now - lastTouchHandledTime < 450) return;

    const r = cv.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;

    handleCanvasInteraction(px, py, false);
  };

  cv.addEventListener('mousemove', onPointerMove, { passive: true });
  cv.addEventListener('mouseleave', onPointerLeave);
  cv.addEventListener('touchstart', onTouchStart, { passive: true });
  cv.addEventListener('touchmove', onTouchMove, { passive: true });
  cv.addEventListener('touchend', onTouchEnd, { passive: true });
  cv.addEventListener('click', onClick);

  const win = cv.ownerDocument?.defaultView;
  if (win) {
    win.addEventListener('resize', layoutCurrentPoem, { passive: true });
  }

  layoutCurrentPoem();

  return () => {
    cancelAnimationFrame(animId);
    observer.disconnect();
    cv.removeEventListener('mousemove', onPointerMove);
    cv.removeEventListener('mouseleave', onPointerLeave);
    cv.removeEventListener('touchstart', onTouchStart);
    cv.removeEventListener('touchmove', onTouchMove);
    cv.removeEventListener('touchend', onTouchEnd);
    cv.removeEventListener('click', onClick);
    cv.style.cursor = '';
    if (win) {
      win.removeEventListener('resize', layoutCurrentPoem);
    }
  };
}
