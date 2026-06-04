import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  template: `
    <!-- ─── Page Header ──────────────────────────────────────────── -->
    <section class="about-hero">
      <div class="container about-hero-inner">
        <div class="about-photo-wrap">
          <div class="about-photo-frame">
            <img src="/author.jpg" alt="Yolanda Santa Cruz" class="about-photo" />
          </div>
        </div>
        <div class="about-header-text">
          <p class="about-eyebrow">about me</p>
          <h1 class="about-headline">Yolanda Santa Cruz</h1>
          <p class="about-tagline">confessional poet &amp; artist</p>
        </div>
      </div>
    </section>

    <!-- ─── Bio ────────────────────────────────────────────────────── -->
    <section class="about-bio">
      <div class="container bio-inner">
        <div class="bio-text">
          <p>
            I view art as a catalyst that can heal and uplift its creators and those who connect with it.
            My poems delve into personal territory, serving as a window into moments of my life where
            emotions ran so deep that they needed expression.
          </p>
          <p>
            I have been published in magazines such as <em>Revista Literaria Visor</em> and <em>Carpa de Sueños</em>,
            and won first place at the poetry contest of the University of Talarrubias, as well as a merit mention
            at the XVII Edition of the International Poetry &amp; Theater Competition "Castello di Duino".
          </p>
          <p>
            If you would like to connect with me and explore more of my work, you can find me on Instagram at&nbsp;
            <a href="https://www.instagram.com/lustloveandmemories" target="_blank" rel="noopener" class="ig-link">
              &#64;lustloveandmemories
            </a>
          </p>
        </div>
      </div>
    </section>

    <!-- ─── Gallery ────────────────────────────────────────────────── -->
    <section class="gallery-section">
      <div class="container">
        <h2 class="section-title">Gallery</h2>
        <div class="gallery-grid">
          <figure class="gallery-item gallery-item--tall">
            <img src="/author.jpg" alt="Yolanda Santa Cruz" />
            <figcaption>Traveling around the world</figcaption>
          </figure>
          <figure class="gallery-item">
            <img src="/book-lust-love-memories.jpg" alt="Lust, Love, and Memories" />
            <figcaption>Poem for Lust, Love, and Memories</figcaption>
          </figure>
          <figure class="gallery-item">
            <img src="/book-longest-nights.jpg" alt="The Longest Nights" />
            <figcaption>Working at the Mauser Residency in Costa Rica</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- ─── Contact CTA ─────────────────────────────────────────────── -->
    <section class="about-contact">
      <div class="container about-contact-inner">
        <h2 class="contact-title">Would like to get in touch?</h2>
        <p class="contact-body">
          Instagram is the best place to
          <a href="https://www.instagram.com/lustloveandmemories" target="_blank" rel="noopener" class="ig-link">do so</a>.
          Just send me a message and I will get back to you as soon as I can :D
        </p>
        <a href="https://www.instagram.com/lustloveandmemories" target="_blank" rel="noopener" class="btn btn--dark">
          Get in touch!
        </a>
      </div>
    </section>
  `,
  styles: `
    /* ─── Hero ──────────────────────────────────────────── */
    .about-hero {
      background: var(--color-bg-warm);
      padding: var(--section-pad) 0 calc(var(--section-pad) * 0.7);
      border-bottom: 1px solid var(--color-border);
    }

    .about-hero-inner {
      display: flex;
      align-items: center;
      gap: clamp(2rem, 5vw, 4rem);
    }

    .about-photo-wrap { flex-shrink: 0; }

    .about-photo-frame {
      width: clamp(140px, 20vw, 220px);
      aspect-ratio: 1;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 0 0 4px var(--color-bg-warm),
                  0 0 0 6px rgba(28,28,28,0.15),
                  0 12px 40px rgba(28,28,28,0.15);
    }

    .about-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .about-eyebrow {
      font-family: var(--font-ui);
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--color-text-muted);
      margin-bottom: 0.5rem;
    }

    .about-headline {
      font-size: clamp(2.2rem, 5vw, 3.2rem);
      font-weight: 400;
      color: var(--color-dark);
      margin-bottom: 0.3rem;
    }

    .about-tagline {
      font-family: var(--font-ui);
      font-size: 0.9rem;
      font-weight: 300;
      letter-spacing: 0.06em;
      color: var(--color-text-muted);
      margin: 0;
    }

    /* ─── Bio ────────────────────────────────────────────── */
    .about-bio {
      padding: var(--section-pad) 0;
      background: var(--color-bg);
    }

    .bio-inner {
      max-width: 680px;
    }

    .bio-text {
      font-size: 1.1rem;
      line-height: 1.8;
      color: rgba(28,28,28,0.8);
    }

    .bio-text p { margin-bottom: 1.4em; }
    .bio-text em { font-style: italic; }

    /* ─── Gallery ────────────────────────────────────────── */
    .gallery-section {
      background: var(--color-bg-warm);
      padding: var(--section-pad) 0;
      border-top: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
    }

    .section-title {
      font-size: clamp(1.8rem, 3.5vw, 2.4rem);
      color: var(--color-dark);
      margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
      font-weight: 400;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      grid-template-rows: auto;
      gap: 1rem;
    }

    .gallery-item {
      margin: 0;
      overflow: hidden;
      border-radius: var(--radius-md);
      box-shadow: 0 4px 20px var(--color-shadow);
      position: relative;
      transition: box-shadow var(--transition-slow), transform var(--transition-slow);
    }

    .gallery-item:hover {
      box-shadow: 0 10px 40px rgba(28,28,28,0.18);
      transform: translateY(-2px);
    }

    .gallery-item img {
      width: 100%;
      height: 260px;
      object-fit: cover;
      display: block;
      transition: transform var(--transition-slow);
    }

    .gallery-item:hover img { transform: scale(1.04); }

    .gallery-item--tall img { height: 100%; min-height: 260px; }

    .gallery-item figcaption {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(28,28,28,0.7));
      color: #fff;
      font-family: var(--font-ui);
      font-size: 0.75rem;
      font-weight: 400;
      letter-spacing: 0.04em;
      padding: 1.5rem 0.9rem 0.75rem;
      opacity: 0;
      transition: opacity var(--transition-base);
    }

    .gallery-item:hover figcaption { opacity: 1; }

    /* ─── Contact ────────────────────────────────────────── */
    .about-contact {
      background: var(--color-bg);
      padding: var(--section-pad) 0;
    }

    .about-contact-inner {
      max-width: 600px;
    }

    .contact-title {
      font-size: clamp(1.8rem, 3.5vw, 2.4rem);
      color: var(--color-dark);
      font-weight: 400;
      margin-bottom: 1rem;
    }

    .contact-body {
      font-size: 1.05rem;
      color: rgba(28,28,28,0.7);
      margin-bottom: 1.75rem;
      line-height: 1.7;
    }

    .ig-link {
      color: var(--color-accent);
      font-style: italic;
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .ig-link:hover { color: var(--color-accent-light); }

    /* ─── Responsive ─────────────────────────────────────── */
    @media (max-width: 680px) {
      .about-hero-inner {
        flex-direction: column;
        text-align: center;
      }

      .gallery-grid {
        grid-template-columns: 1fr 1fr;
      }

      .gallery-item--tall { grid-column: 1 / -1; }
    }

    @media (max-width: 460px) {
      .gallery-grid { grid-template-columns: 1fr; }
    }
  `,
})
export default class About {}
