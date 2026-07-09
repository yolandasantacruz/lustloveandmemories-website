import { Component, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-about',
  template: `
    <!-- ═══ HERO ════════════════════════════════════════════ -->
    <section class="about-hero">
      <div class="about-hero__bg" aria-hidden="true">
        <img src="/poem-flower.jpg" alt="" />
        <div class="about-hero__overlay"></div>
      </div>
      <div class="container about-hero__content">
        <div class="about-hero__text reveal">
          <p class="text-label">The Author</p>
          <h1 class="about-headline">
            <em>Yolanda</em>
            <span>Santa Cruz</span>
          </h1>
        </div>
      </div>
    </section>

    <!-- ═══ BIO ══════════════════════════════════════════════ -->
    <section class="bio-section">
      <div class="container bio-inner">
        <!-- Portrait column -->
        <aside class="bio-portrait reveal">
          <div class="bio-portrait__frame">
            <img src="/author.jpg" alt="Yolanda Santa Cruz" />
          </div>
          <div class="bio-portrait__caption">
            <p class="text-label">Yolanda Santa Cruz</p>
            <p>&#64;<a href="https://www.instagram.com/lustloveandmemories" target="_blank" rel="noopener" class="ig-link">lustloveandmemories</a></p>
          </div>
        </aside>

        <!-- Text column -->
        <div class="bio-text">
          <p class="bio-intro reveal">
            I view art as a catalyst that can heal and uplift its creators and those who connect with it.
          </p>
          <p class="reveal reveal-delay-1">
            My poems delve into personal territory, serving as a window into moments of my life where
            emotions ran so deep that they needed expression.
          </p>
          <p class="reveal reveal-delay-2">
            I have been published in magazines such as <em>Revista Literaria Visor</em> and <em>Carpa de Sueños</em>,
            and won first place at the poetry contest of the University of Talarrubias, as well as a merit mention
            at the XVII Edition of the International Poetry &amp; Theater Competition "Castello di Duino".
          </p>
          <p class="reveal reveal-delay-3">
            If you would like to connect with me and explore more of my work, find me on Instagram at
            <a href="https://www.instagram.com/lustloveandmemories" target="_blank" rel="noopener" class="ig-link">
              &#64;lustloveandmemories
            </a>
          </p>

          <!-- Achievements pills -->
          <div class="achievements reveal reveal-delay-3">
            <div class="achievement">
              <span class="achievement__icon">✦</span>
              <span>1st Place — University of Talarrubias Poetry Contest</span>
            </div>
            <div class="achievement">
              <span class="achievement__icon">✦</span>
              <span>Merit mention — XVII Castello di Duino International Competition</span>
            </div>
            <div class="achievement">
              <span class="achievement__icon">✦</span>
              <span>Published in Revista Literaria Visor &amp; Carpa de Sueños</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ GALLERY ════════════════════════════════════════════ -->
    <section class="gallery-section">
      <div class="container">
        <header class="gallery-header reveal">
          <p class="text-label">Moments</p>
          <h2 class="gallery-title">Gallery</h2>
        </header>

        <div class="gallery-grid">
          <figure class="gallery-item gallery-item--large reveal">
            <img src="/author.jpg" alt="Yolanda Santa Cruz traveling" loading="lazy" />
            <figcaption>Traveling around the world</figcaption>
          </figure>
          <figure class="gallery-item reveal reveal-delay-1">
            <img src="/working.jpg" alt="Working at the Mauser Residency" loading="lazy" />
            <figcaption>Working at the Mauser Residency, Costa Rica</figcaption>
          </figure>
          <figure class="gallery-item reveal reveal-delay-2">
            <img src="/poem-page.jpg" alt="Poem page from Lust Love and Memories" loading="lazy" />
            <figcaption>Poem from <em>Lust, Love, and Memories</em></figcaption>
          </figure>
          <figure class="gallery-item reveal reveal-delay-1">
            <img src="/poem-art.jpg" alt="Poem art" loading="lazy" />
            <figcaption>"Entry as Exit" Poem</figcaption>
          </figure>
          <figure class="gallery-item reveal reveal-delay-2">
            <img src="/travel.jpg" alt="Travel photography" loading="lazy" />
            <figcaption>Somewhere between here and there</figcaption>
          </figure>
          <figure class="gallery-item reveal reveal-delay-3">
            <img src="/poem-flower.jpg" alt="Poem with flower" loading="lazy" />
            <figcaption>"In the garden of life" Poem</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- ═══ CONTACT ════════════════════════════════════════════ -->
    <section class="about-contact">
      <div class="container contact-inner">
        <div class="ornament reveal">✦</div>
        <h2 class="contact-title reveal reveal-delay-1">Would like to get in touch?</h2>
        <p class="contact-body reveal reveal-delay-2">
          Instagram is the best place to do so. Just send me a message and I will get back to you as soon as I can :D
        </p>
        <a href="https://www.instagram.com/lustloveandmemories" target="_blank" rel="noopener"
           class="btn btn--primary reveal reveal-delay-3">
          Get in touch!
        </a>
      </div>
    </section>
  `,
  styles: `
    /* ═══ HERO ════════════════════════════════════════════════ */
    .about-hero {
      position: relative;
      height: clamp(360px, 50vh, 560px);
      display: flex;
      align-items: flex-end;
      overflow: hidden;
    }

    .about-hero__bg {
      position: absolute;
      inset: 0;
    }

    .about-hero__bg img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 60%;
      filter: saturate(0.5) brightness(0.7);
    }

    .about-hero__overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        rgba(14,12,10,0.97) 0%,
        rgba(14,12,10,0.5) 50%,
        rgba(14,12,10,0.2) 100%
      );
    }

    .about-hero__content {
      position: relative;
      z-index: 1;
      padding-bottom: clamp(2.5rem, 5vw, 4rem);
    }

    .about-hero__text .text-label { margin-bottom: 0.75rem; }

    .about-headline {
      font-family: var(--font-display);
      font-weight: 300;
      line-height: 0.9;
      color: var(--parchment);
    }

    .about-headline em {
      display: block;
      font-style: italic;
      font-size: clamp(3rem, 7vw, 6rem);
      color: var(--gold-light);
    }

    .about-headline span {
      display: block;
      font-size: clamp(2rem, 5vw, 4rem);
      font-style: normal;
      letter-spacing: 0.02em;
    }

    /* ═══ BIO ══════════════════════════════════════════════════ */
    .bio-section {
      background: var(--surface);
      padding: var(--section-v) 0;
      border-bottom: 1px solid var(--border);
    }

    .bio-inner {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: clamp(3rem, 6vw, 6rem);
      align-items: start;
    }

    /* Portrait */
    .bio-portrait {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      position: sticky;
      top: 110px;
    }

    .bio-portrait__frame {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid var(--border);
      box-shadow: 0 0 0 6px rgba(201,169,110,0.05),
                  0 24px 60px rgba(0,0,0,0.5);
    }

    .bio-portrait__frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: saturate(0.85);
    }

    .bio-portrait__caption {
      text-align: center;
    }

    .bio-portrait__caption .text-label { margin-bottom: 0.4rem; }

    .bio-portrait__caption p:last-child {
      font-family: var(--font-body);
      font-size: 0.78rem;
      color: var(--text-tertiary);
    }

    /* Bio text */
    .bio-text {
      display: flex;
      flex-direction: column;
      gap: 1.4rem;
    }

    .bio-intro {
      font-family: var(--font-display);
      font-style: italic;
      font-size: clamp(1.3rem, 2.5vw, 1.7rem);
      font-weight: 300;
      line-height: 1.4;
      color: var(--parchment);
    }

    .bio-text p:not(.bio-intro) {
      font-family: var(--font-body);
      font-size: 0.97rem;
      font-weight: 300;
      line-height: 1.85;
      color: var(--text-secondary);
    }

    .bio-text em {
      font-style: italic;
      font-family: var(--font-display);
      font-size: 1.1em;
      color: var(--parchment);
    }

    /* Achievements */
    .achievements {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      border-top: 1px solid var(--border);
      padding-top: 2rem;
      margin-top: 0.5rem;
    }

    .achievement {
      display: flex;
      align-items: flex-start;
      gap: 0.9rem;
      font-family: var(--font-body);
      font-size: 0.83rem;
      font-weight: 300;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .achievement__icon {
      color: var(--gold);
      font-size: 0.6rem;
      flex-shrink: 0;
      margin-top: 0.3em;
    }

    /* ═══ GALLERY ════════════════════════════════════════════ */
    .gallery-section {
      background: var(--ink);
      padding: var(--section-v) 0;
    }

    .gallery-header {
      margin-bottom: clamp(2.5rem, 5vw, 4rem);
    }

    .gallery-header .text-label { margin-bottom: 0.75rem; }

    .gallery-title {
      font-family: var(--font-display);
      font-style: italic;
      font-weight: 300;
      font-size: clamp(2.2rem, 4.5vw, 3.5rem);
      color: var(--parchment);
      line-height: 1;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: auto auto;
      gap: 2px;
    }

    .gallery-item--large {
      grid-row: span 2;
    }

    .gallery-item {
      margin: 0;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      background: var(--surface-2);
    }

    .gallery-item img {
      width: 100%;
      height: 100%;
      min-height: 240px;
      object-fit: cover;
      filter: saturate(0.75) brightness(0.9);
      transition: filter var(--dur-slow) var(--ease-out),
                  transform var(--dur-slow) var(--ease-out);
      display: block;
    }

    .gallery-item--large img { min-height: 100%; }

    .gallery-item:hover img {
      filter: saturate(1) brightness(1);
      transform: scale(1.04);
    }

    .gallery-item figcaption {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 2rem 1rem 1rem;
      background: linear-gradient(transparent, rgba(14,12,10,0.85));
      font-family: var(--font-body);
      font-size: 0.73rem;
      letter-spacing: 0.08em;
      color: var(--parchment);
      opacity: 0;
      transition: opacity var(--dur-med) ease;
    }

    .gallery-item:hover figcaption { opacity: 1; }

    .gallery-item figcaption em {
      font-style: italic;
      font-family: var(--font-display);
    }

    /* ═══ CONTACT ════════════════════════════════════════════ */
    .about-contact {
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
      font-family: var(--font-display);
      font-style: italic;
      font-weight: 300;
      font-size: clamp(2rem, 4.5vw, 3.5rem);
      color: var(--parchment);
      line-height: 1.1;
    }

    .contact-body {
      font-family: var(--font-body);
      font-size: 0.95rem;
      font-weight: 300;
      color: var(--text-secondary);
      max-width: 44ch;
      line-height: 1.75;
    }

    /* ═══ LINKS ════════════════════════════════════════════ */
    .ig-link {
      color: var(--gold);
      border-bottom: 1px solid rgba(201,169,110,0.35);
      padding-bottom: 0.05em;
      transition: border-color var(--dur-fast) ease, color var(--dur-fast) ease;
    }
    .ig-link:hover {
      color: var(--gold-light);
      border-color: var(--gold-light);
    }

    /* ═══ RESPONSIVE ══════════════════════════════════════ */
    @media (max-width: 768px) {
      .bio-inner {
        grid-template-columns: 1fr;
      }

      .bio-portrait {
        position: static;
        max-width: 200px;
        margin: 0 auto;
      }

      .gallery-grid {
        grid-template-columns: 1fr 1fr;
      }

      .gallery-item--large {
        grid-column: span 2;
        grid-row: span 1;
      }
    }

    @media (max-width: 480px) {
      .gallery-grid { grid-template-columns: 1fr; }
      .gallery-item--large { grid-column: span 1; }
    }
  `,
})
export default class About implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Hero triggers immediately
    this.document.querySelectorAll('.about-hero .reveal').forEach(el => el.classList.add('visible'));

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    this.document.querySelectorAll('.bio-section .reveal, .gallery-section .reveal, .about-contact .reveal')
      .forEach(el => observer.observe(el));
  }
}
