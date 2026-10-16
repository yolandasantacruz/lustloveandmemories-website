/**
 * Organic mouse tilt & subtle kinetic typography on interactive headings.
 */
export function setupLiveLetters(rootEl: HTMLElement, prefersReducedMotion: boolean): void {
  const liveEls = rootEl.querySelectorAll<HTMLElement>('.live');
  liveEls.forEach((el) => {
    // Avoid double-wrapping
    if (el.dataset['liveInit'] === 'true') return;
    el.dataset['liveInit'] = 'true';

    const walk = (n: Node) => {
      Array.from(n.childNodes).forEach((c) => {
        if (c.nodeType === 3 && c.textContent) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach((part: string) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.append(part);
              return;
            }
            const w = document.createElement('span');
            w.style.whiteSpace = 'nowrap';
            w.style.display = 'inline-block';
            Array.from(part).forEach((ch) => {
              const s = document.createElement('span');
              s.className = 'live-char';
              s.textContent = ch;
              s.style.display = 'inline-block';
              s.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
              s.style.willChange = 'transform';
              w.append(s);
            });
            frag.append(w);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1) {
          walk(c);
        }
      });
    };
    walk(el);

    if (prefersReducedMotion) return;

    const letters = Array.from(el.querySelectorAll<HTMLElement>('.live-char'));
    const host = el.closest('button') || el;
    let centers: [number, number, number][] = [];

    host.addEventListener('pointerenter', () => {
      centers = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2, r.height];
      });
    });

    host.addEventListener('pointermove', (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !centers.length) return;
      letters.forEach((l, i) => {
        const center = centers.at(i);
        if (!center) return;
        const [cx, cy, h] = center;
        const dx = cx - e.clientX;
        const dy = cy - e.clientY;
        const s = h * 1.6;
        const f = Math.exp(-(dx * dx + dy * dy * 0.5) / (s * s));
        if (f > 0.02) {
          l.style.transform = `translate(${(dx * 0.1 * f).toFixed(1)}px, ${(-h * 0.22 * f).toFixed(1)}px) rotate(${(
            (dx / s) *
            -9 *
            f
          ).toFixed(1)}deg)`;
        } else {
          l.style.transform = '';
        }
      });
    });

    host.addEventListener('pointerleave', () => {
      letters.forEach((l) => (l.style.transform = ''));
    });
  });
}
