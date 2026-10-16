import { CuratedPoem } from './poems.data';
import { clamp, getDpr, lerp, NOOP } from '../common/math';

function getBookSlug(bookTitle: string): string {
  if (bookTitle.toLowerCase().includes('longest')) {
    return 'the-longest-nights';
  }
  return 'lust-love-and-memories';
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
  let isFullyRevealed = false;
  let fullyRevealedTime = 0;
  let isFadingOut = false;
  let fadeStartTime = 0;
  let hasStarted = false;
  let lastActivityTime = performance.now();

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

    // Natural responsive word wrapping to prevent text clipping at any screen width
    ctx!.font = `italic ${fontSize}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;
    const maxVerseWidth = Math.max(260, W - 48);

    const verseLines: string[] = [];
    activePoem.lines.forEach((line) => {
      const words = line.split(' ');
      let currentLine = '';
      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testW = ctx!.measureText(testLine).width;
        if (testW > maxVerseWidth && currentLine) {
          verseLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) {
        verseLines.push(currentLine);
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
    const singleLineCitation = `${activePoem.title} · ${activePoem.book}`;
    const singleWidth = ctx!.measureText(singleLineCitation).width;
    const maxCitationWidth = Math.max(120, W - 48);

    const citationLines =
      singleWidth <= maxCitationWidth
        ? [singleLineCitation]
        : [activePoem.title, activePoem.book];

    const totalVerseHeight = (verseLines.length - 1) * lineHeight;
    const totalCitationHeight = (citationLines.length - 1) * citationLineHeight;
    const totalBlockHeight = totalVerseHeight + citationSpacing + totalCitationHeight;

    const startY = Math.max(30, Math.round((H - totalBlockHeight) / 2 + fontSize * 0.72));

    chars = [];
    const bookChars: CharGlyph[] = [];

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

    // 2. Layout citation line(s) character-by-character (Regular font, matching .sec-desc size and var(--ink-muted) #78716c)
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
        currentX += w + spaceW;
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

    const delta = Math.min(32, Math.max(1, now - lastDrawTime));
    lastDrawTime = now;

    const isAttributionVisible =
      prefersReducedMotion ||
      (isFullyRevealed && fullyRevealedTime > 0 && now - fullyRevealedTime >= 1000 && !isFadingOut);

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

      const alpha = c.reveal * fadeMultiplier * (c.opacity ?? 1);
      if (alpha <= 0.005) continue;

      ctx.save();
      const fontStyle = c.isAttribution ? 'normal' : 'italic';
      ctx.font = `${fontStyle} ${c.fontSize}px "EB Garamond", "Iowan Old Style", "Palatino Linotype", "Palatino", Georgia, serif`;

      let charColor = c.color ?? color;
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

    // Check if hovering over the clickable book title link
    const now = performance.now();
    const isAttributionVisible =
      prefersReducedMotion ||
      (isFullyRevealed && fullyRevealedTime > 0 && now - fullyRevealedTime >= 1000 && !isFadingOut);

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

  const onClick = (e: MouseEvent) => {
    const now = performance.now();
    const isAttributionVisible =
      prefersReducedMotion ||
      (isFullyRevealed && fullyRevealedTime > 0 && now - fullyRevealedTime >= 1000 && !isFadingOut);

    if (!isAttributionVisible || !bookBounds) return;

    const r = cv.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;

    if (
      px >= bookBounds.x &&
      px <= bookBounds.x + bookBounds.w &&
      py >= bookBounds.y &&
      py <= bookBounds.y + bookBounds.h
    ) {
      const targetUrl = `/books/${bookBounds.slug}`;
      if (e.metaKey || e.ctrlKey) {
        window.open(targetUrl, '_blank');
      } else if (onNavigate) {
        onNavigate(targetUrl);
      } else {
        window.location.href = targetUrl;
      }
    }
  };

  cv.addEventListener('mousemove', onPointerMove, { passive: true });
  cv.addEventListener('mouseleave', onPointerLeave);
  cv.addEventListener('touchstart', onTouchMove, { passive: true });
  cv.addEventListener('touchmove', onTouchMove, { passive: true });
  cv.addEventListener('touchend', onPointerLeave);
  cv.addEventListener('click', onClick);
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
    cv.removeEventListener('click', onClick);
    cv.style.cursor = '';
    window.removeEventListener('resize', layoutCurrentPoem);
  };
}
