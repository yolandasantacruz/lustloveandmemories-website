import { Component, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, DOCUMENT, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgOptimizedImage],
  template: `
    <!-- ═══ HERO ═══════════════════════════════════════════════════ -->
    <section class="hero">
      <!-- Atmospheric background layers -->
      <div class="hero-bg" aria-hidden="true">
        <div class="hero-bg__image">
          <img src="/images/travel.webp" alt="" aria-hidden="true" fetchpriority="high" decoding="sync" />
        </div>
        <div class="hero-bg__gradient"></div>
        <div class="hero-bg__vignette"></div>
        <div class="hero-bg__grain"></div>
      </div>

      <div class="hero-content container">
        <div class="hero-text">
          <p class="text-label hero-eyebrow reveal">confessional poet · artist</p>
          <h1 class="hero-headline reveal reveal-delay-1">
            <em>Hey there,</em>
            <span class="hero-headline__line2">I'm Yolanda.</span>
          </h1>
          <p class="hero-body reveal reveal-delay-2">
            I passionately believe in the therapeutic power of art.
            Through my words, I have documented the evolution of passions
            and heartbreaks I have encountered along the way.
          </p>
          <div class="hero-actions reveal reveal-delay-3">
            <a routerLink="/books" class="btn btn--primary">Explore my books</a>
            <a routerLink="/about" class="btn btn--ghost">About me</a>
          </div>
        </div>

        <!-- Author portrait -->
        <div class="hero-portrait reveal reveal-delay-2">
          <div class="hero-portrait__frame">
            <img
              src="/images/author-800w.webp"
              srcset="/images/author-400w.webp 400w, /images/author-800w.webp 800w"
              sizes="(max-width: 768px) 100vw, 400px"
              width="800"
              height="796"
              alt="Yolanda Santa Cruz"
              fetchpriority="high"
              decoding="sync"
            />
          </div>
          <div class="hero-portrait__glow" aria-hidden="true"></div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="scroll-hint reveal reveal-delay-4" aria-hidden="true">
        <span class="scroll-hint__line"></span>
        <span class="scroll-hint__label">scroll</span>
      </div>
    </section>

    <!-- ═══ QUOTE INTERLUDE ═════════════════════════════════════════ -->
    <section class="quote-section">
      <div class="container">
        <div class="quote-wrap reveal">
          <div class="ornament">✦</div>
          <blockquote class="quote-text">
            "Happy moments don't want to come out.
            We don't want them to.
            We want to keep them contained within us
            for as long as possible.
            That is why it is so hard to write about them."
          </blockquote>
          <cite class="quote-attr">— Yolanda Santa Cruz, <em>Lust, Love, and Memories</em></cite>
        </div>
      </div>
    </section>

    <!-- ═══ BOOKS ════════════════════════════════════════════════════ -->
    <section class="books-section">
      <div class="container">
        <header class="section-header reveal">
          <p class="text-label">Written Works</p>
          <h2 class="section-title">
            <a routerLink="/books">Books</a>
          </h2>
        </header>

        <div class="books-grid">
          <!-- Book 1 -->
          <article class="book-card reveal reveal-delay-1">
            <div class="book-card__cover-wrap">
              <a href="/books/lust-love-and-memories" class="book-card__cover-link" aria-label="Order Lust, Love, and Memories">
                <img ngSrc="images/book-lust-love-memories.webp" width="1280" height="1478" alt="Lust, Love, and Memories" class="book-card__cover" ngSrcset="400w, 800w, 1200w" sizes="(max-width: 768px) 100vw, 400px" />
                <div class="book-card__cover-glow"></div>
              </a>
            </div>
            <div class="book-card__body">
              <p class="book-card__num text-label">Vol. I</p>
              <h3 class="book-card__title">Lust, Love,<br/>and Memories</h3>
              <div class="divider"></div>
              <p class="book-card__desc">
                A compilation of poems that focuses on all stages of romantic relationships — from the desire
                and excitement felt at the very beginning, to the aftermath of them.
              </p>
              <a href="/books/lust-love-and-memories" class="btn" aria-label="Read more about Lust, Love, and Memories">Read more</a>
            </div>
          </article>

          <!-- Book 2 -->
          <article class="book-card book-card--dark reveal reveal-delay-2">
            <div class="book-card__cover-wrap">
              <a href="/books/the-longest-nights" class="book-card__cover-link" aria-label="Order The Longest Nights">
                <img ngSrc="images/book-longest-nights.webp" width="1280" height="1460" alt="The Longest Nights" class="book-card__cover" ngSrcset="400w, 800w, 1200w" sizes="(max-width: 768px) 100vw, 400px" />
                <div class="book-card__cover-glow book-card__cover-glow--blue"></div>
              </a>
            </div>
            <div class="book-card__body">
              <p class="book-card__num text-label">Vol. II</p>
              <h3 class="book-card__title">The Longest<br/>Nights</h3>
              <div class="divider"></div>
              <p class="book-card__desc">
                A deep dive into the healing journey after experiencing a romantic loss.
                With each chapter dedicated to the five stages of grief, from denial to acceptance.
              </p>
              <a href="/books/the-longest-nights" class="btn" aria-label="Read more about The Longest Nights">Read more</a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ═══ POEM IMAGE FEATURE ═══════════════════════════════════════ -->
    <section class="feature-section">
      <div class="feature-grid">
        <div class="feature-image reveal">
          <img ngSrc="images/poem-flower.webp" width="1130" height="1155" alt="poem art" ngSrcset="400w, 800w, 1200w" sizes="(max-width: 768px) 100vw, 50vw" />
          <div class="feature-image__overlay"></div>
        </div>

        <div class="feature-text-wrap">
          <div class="feature-text reveal reveal-delay-1">
            <p class="text-label">From the pages</p>
            <blockquote class="feature-quote">
              "some flowers get killed<br/>
              before they get<br/>
              their chance to flourish."
            </blockquote>
            <a routerLink="/books" class="btn" style="margin-top:2rem">Read the books</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ CONTACT ═══════════════════════════════════════════════════ -->
    <section class="contact-section">
      <div class="container contact-inner">
        <div class="ornament reveal">✦</div>
        <h2 class="contact-title text-display reveal reveal-delay-1">Get in touch</h2>
        <p class="contact-body reveal reveal-delay-2">
          Instagram is the best place to reach me. Send me a message and I'll get back to you as soon as I can :D
        </p>
        <a href="https://www.instagram.com/lustloveandmemories" target="_blank" rel="noopener"
           class="btn reveal reveal-delay-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <rect x="2" y="2" width="20" height="20" rx="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
          </svg>
          Let's talk!
        </a>
      </div>
    </section>
  `,
  styles: `
    /* ═══ HERO ══════════════════════════════════════════════ */
    .hero {
      position: relative;
      min-height: 100svh;
      display: flex;
      align-items: center;
      overflow: hidden;
    }

    /* Background layers */
    .hero-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .hero-bg__image {
      position: absolute;
      inset: 0;
    }
    .hero-bg__image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 30%;
      filter: saturate(0.6);
      transform: scale(1.04);
      animation: slowKen 20s ease-in-out infinite alternate;
    }
    @keyframes slowKen {
      from { transform: scale(1.04) translate(0, 0); }
      to   { transform: scale(1.08) translate(-1%, -1%); }
    }

    .hero-bg__gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        rgba(14,12,10,0.92) 0%,
        rgba(14,12,10,0.7) 50%,
        rgba(14,12,10,0.55) 100%
      );
    }

    .hero-bg__vignette {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at center, transparent 30%, rgba(14,12,10,0.6) 100%);
    }

    .hero-bg__grain {
      position: absolute;
      inset: 0;
      opacity: 0.035;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      background-size: 200px 200px;
    }

    /* Content */
    .hero-content {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: clamp(3rem, 6vw, 6rem);
      padding-top: 90px;
      padding-bottom: 6rem;
    }

    .hero-eyebrow {
      margin-bottom: 1.2rem;
    }

    .hero-headline {
      font-family: var(--font-display);
      font-weight: 300;
      font-style: normal;
      line-height: 0.95;
      color: var(--parchment);
      margin-bottom: 1.75rem;
    }

    .hero-headline em {
      display: block;
      font-style: italic;
      font-size: clamp(3.8rem, 8vw, 6.5rem);
      color: var(--gold-light);
    }

    .hero-headline__line2 {
      display: block;
      font-size: clamp(2.8rem, 6vw, 4.8rem);
      font-style: normal;
      font-weight: 300;
      letter-spacing: -0.01em;
      color: var(--parchment);
      margin-top: 0.1em;
    }

    .hero-body {
      font-family: var(--font-body);
      font-size: clamp(0.95rem, 1.5vw, 1.08rem);
      font-weight: 300;
      line-height: 1.8;
      color: var(--text-secondary);
      max-width: 44ch;
      margin-bottom: 2.5rem;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    /* Portrait */
    .hero-portrait {
      position: relative;
      flex-shrink: 0;
    }

    .hero-portrait__frame {
      width: clamp(180px, 22vw, 300px);
      aspect-ratio: 1;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid rgba(201,169,110,0.25);
      box-shadow: 0 0 0 8px rgba(201,169,110,0.06),
                  0 32px 80px rgba(0,0,0,0.5);
    }

    .hero-portrait__frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: saturate(0.85);
    }

    .hero-portrait__glow {
      position: absolute;
      inset: -20%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%);
      pointer-events: none;
    }

    /* Scroll hint */
    .scroll-hint {
      position: absolute;
      bottom: 2.5rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      z-index: 1;
    }

    .scroll-hint__line {
      display: block;
      width: 1px;
      height: 48px;
      background: linear-gradient(to bottom, var(--gold), transparent);
      opacity: 0.5;
      animation: scrollPulse 2.2s ease-in-out infinite;
    }
    @keyframes scrollPulse {
      0%, 100% { opacity: 0.2; transform: scaleY(0.7); transform-origin: top; }
      50%       { opacity: 0.6; transform: scaleY(1); }
    }

    .scroll-hint__label {
      font-family: var(--font-body);
      font-size: 0.6rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--gold);
      opacity: 0.5;
    }

    /* ═══ QUOTE ══════════════════════════════════════════════ */
    .quote-section {
      background: var(--ink-soft);
      padding: clamp(4rem, 8vw, 7rem) 0;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .quote-wrap {
      max-width: 700px;
      margin: 0 auto;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .quote-text {
      font-family: var(--font-display);
      font-style: italic;
      font-weight: 300;
      font-size: clamp(1.4rem, 3vw, 2rem);
      line-height: 1.5;
      color: var(--parchment);
      letter-spacing: -0.01em;
    }

    .quote-attr {
      font-family: var(--font-body);
      font-size: 0.78rem;
      font-weight: 400;
      letter-spacing: 0.08em;
      color: var(--gold);
      opacity: 0.7;
    }

    .quote-attr em { font-style: italic; font-family: var(--font-display); }

    /* ═══ BOOKS ══════════════════════════════════════════════ */
    .books-section {
      background: var(--surface);
      padding: var(--section-v) 0;
    }

    .section-header {
      margin-bottom: clamp(3rem, 6vw, 5rem);
    }

    .section-header .text-label { margin-bottom: 0.75rem; }

    .section-title {
      font-family: var(--font-display);
      font-style: italic;
      font-weight: 300;
      font-size: clamp(2.5rem, 5vw, 3.8rem);
      color: var(--parchment);
      line-height: 1;
      margin-bottom: 0.75rem;
    }

    .section-title a {
      color: inherit;
      text-decoration: none;
      transition: color var(--dur-fast) var(--ease-out);
    }

    .section-title a:hover {
      color: var(--gold);
    }

    .section-sub {
      font-family: var(--font-body);
      font-size: 0.88rem;
      font-weight: 300;
      color: var(--text-secondary);
      letter-spacing: 0.04em;
    }

    .books-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5px;
      border: 1px solid var(--border);
    }

    .book-card {
      display: grid;
      grid-template-columns: 1fr;
      align-items: start;
      background: var(--surface-2);
      padding: clamp(2rem, 4vw, 3.5rem);
      position: relative;
      overflow: hidden;
      transition: background var(--dur-med) ease;
    }

    .book-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
      opacity: 0;
      transition: opacity var(--dur-med) ease;
    }

    .book-card:hover::before { opacity: 1; }
    .book-card:hover { background: rgba(30,26,22,0.95); }

    .book-card__cover-wrap {
      position: relative;
      margin-bottom: 2rem;
      display: flex;
      justify-content: center;
    }

    .book-card__cover-link { position: relative; display: block; }

    .book-card__cover {
      width: clamp(140px, 22vw, 220px);
      height: auto;
      display: block;
      border-radius: 2px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3);
      transition: transform var(--dur-slow) var(--ease-out),
                  box-shadow var(--dur-slow) var(--ease-out);
    }

    .book-card__cover-link:hover .book-card__cover {
      transform: translateY(-8px) rotate(-1deg);
      box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.4);
    }

    .book-card__cover-glow {
      position: absolute;
      inset: 20%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(140,58,58,0.3) 0%, transparent 70%);
      filter: blur(20px);
      pointer-events: none;
      z-index: -1;
    }

    .book-card__cover-glow--blue {
      background: radial-gradient(circle, rgba(60,80,160,0.3) 0%, transparent 70%);
    }

    .book-card__body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .book-card__num { margin-bottom: 0.25rem; }

    .book-card__title {
      font-family: var(--font-display);
      font-style: italic;
      font-weight: 300;
      font-size: clamp(1.7rem, 2.8vw, 2.3rem);
      line-height: 1.1;
      color: var(--parchment);
      margin: 0;
    }

    .book-card__desc {
      font-family: var(--font-body);
      font-size: 0.88rem;
      font-weight: 300;
      line-height: 1.75;
      color: var(--text-secondary);
      margin: 0.5rem 0;
    }

    /* ═══ FEATURE ════════════════════════════════════════════ */
    .feature-section {
      background: var(--ink);
    }

    .feature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 520px;
    }

    .feature-image {
      position: relative;
      overflow: hidden;
    }

    .feature-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--dur-slow) var(--ease-out);
    }

    .feature-image:hover img { transform: scale(1.04); }

    .feature-image__overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, transparent 50%, var(--ink) 100%);
    }

    .feature-text-wrap {
      display: flex;
      align-items: center;
      padding: clamp(2.5rem, 5vw, 5rem);
      background: var(--ink);
    }

    .feature-text {
      max-width: 400px;
    }

    .feature-text .text-label { margin-bottom: 1.5rem; }

    .feature-quote {
      font-family: var(--font-display);
      font-style: italic;
      font-weight: 300;
      font-size: clamp(1.5rem, 2.5vw, 2.1rem);
      line-height: 1.45;
      color: var(--parchment);
      letter-spacing: -0.01em;
      border-left: 1px solid var(--gold);
      padding-left: 1.5rem;
      opacity: 0.9;
    }

    /* ═══ CONTACT ════════════════════════════════════════════ */
    .contact-section {
      background: var(--ink-soft);
      border-top: 1px solid var(--border);
      padding: var(--section-v) 0;
    }

    .contact-inner {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .contact-title {
      font-size: clamp(2.5rem, 5vw, 4rem);
      color: var(--parchment);
      font-weight: 300;
    }

    .contact-body {
      font-family: var(--font-body);
      font-size: 1rem;
      font-weight: 300;
      color: var(--text-secondary);
      max-width: 46ch;
      line-height: 1.75;
    }

    /* ═══ RESPONSIVE ════════════════════════════════════════ */
    @media (max-width: 768px) {
      .hero-content {
        grid-template-columns: 1fr;
        text-align: center;
        padding-top: 120px;
      }

      .hero-portrait { display: flex; justify-content: center; order: -1; }

      .hero-body { max-width: 100%; margin-inline: auto; }

      .hero-actions { justify-content: center; }

      .books-grid { grid-template-columns: 1fr; gap: 1px; }

      .feature-grid { grid-template-columns: 1fr; }
      .feature-image { height: 320px; }
      .feature-image__overlay {
        background: linear-gradient(to bottom, transparent 50%, var(--ink) 100%);
      }
    }
  `,
})
export default class Home implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    this.document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Trigger hero reveals immediately
    this.document.querySelectorAll('.hero .reveal').forEach(el => {
      el.classList.add('visible');
    });
  }
}
