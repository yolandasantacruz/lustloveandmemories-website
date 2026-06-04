import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <!-- ─── Hero ─────────────────────────────────────────────── -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-text">
          <p class="hero-eyebrow">confessional poet &amp; artist</p>
          <h1 class="hero-headline">
            Hey there!
          </h1>
          <p class="hero-body">
            I am a confessional poet and artist who passionately believes in the therapeutic power of art.
            Through my words, I have documented the evolution of passions and heartbreaks I have encountered along the way.
          </p>
          <a routerLink="/about" class="btn btn--dark">More about me</a>
        </div>
        <div class="hero-image-wrap">
          <div class="hero-image-frame">
            <img src="/author.jpg" alt="Yolanda Santa Cruz" class="hero-image" />
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Books ─────────────────────────────────────────────── -->
    <section class="books-section">
      <div class="container">
        <h2 class="section-title">Books</h2>
        <div class="books-grid">

          <article class="book-card">
            <a href="https://www.amazon.com" target="_blank" rel="noopener" class="book-card__cover-link" aria-label="Order Lust, Love, and Memories">
              <img src="/book-lust-love-memories.jpg" alt="Lust, Love, and Memories book cover" class="book-card__cover" />
            </a>
            <div class="book-card__body">
              <h3 class="book-card__title">Lust, Love, and Memories</h3>
              <p class="book-card__desc">
                Compilation of poems that focuses on all stages of romantic relationships, from the desire and excitement felt at the very beginning, to the aftermath of them.
              </p>
              <a href="https://www.amazon.com" target="_blank" rel="noopener" class="btn btn--dark">Order book</a>
            </div>
          </article>

          <article class="book-card">
            <a href="https://www.amazon.com" target="_blank" rel="noopener" class="book-card__cover-link" aria-label="Order The Longest Nights">
              <img src="/book-longest-nights.jpg" alt="The Longest Nights book cover" class="book-card__cover" />
            </a>
            <div class="book-card__body">
              <h3 class="book-card__title">The Longest Nights</h3>
              <p class="book-card__desc">
                Deep dive into the healing journey the author went through after experiencing a romantic loss.
                With each chapter dedicated to the five most renowned stages of grieving, you will encounter poems that range from complete denial of the present, to the acceptance that comes only after you make peace with the past.
              </p>
              <a href="https://www.amazon.com" target="_blank" rel="noopener" class="btn btn--dark">Order book</a>
            </div>
          </article>

        </div>
      </div>
    </section>

    <!-- ─── Contact CTA ────────────────────────────────────────── -->
    <section class="contact-section">
      <div class="container contact-inner">
        <div class="contact-text">
          <h2 class="contact-title">Would like to get in touch?</h2>
          <p class="contact-body">
            Instagram is the best place to do so. Just send me a message and I will get back to you as soon as I can :D
          </p>
          <a href="https://www.instagram.com/lustloveandmemories" target="_blank" rel="noopener" class="btn btn--outline">
            Let's talk!
          </a>
        </div>
        <div class="contact-deco" aria-hidden="true">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="140" height="140" opacity="0.12">
            <path fill="var(--color-dark)" d="M44.7,-76.4C58.8,-70.1,71.6,-58.3,79.5,-44.1C87.4,-29.9,90.5,-13.2,88.1,2.4C85.7,18,77.8,32.7,68.7,46.2C59.6,59.7,49.3,72,36.1,79.1C22.9,86.2,6.9,88.1,-8.9,86.1C-24.7,84.1,-40.4,78.2,-53.5,69.4C-66.6,60.6,-77.1,48.9,-83.1,35C-89.1,21.1,-90.7,5,-87.5,-10.2C-84.3,-25.4,-76.3,-39.8,-65.4,-51.6C-54.5,-63.4,-40.7,-72.6,-26.1,-77.5C-11.5,-82.4,4,-83,18.8,-81.1C33.6,-79.2,30.6,-82.7,44.7,-76.4Z" transform="translate(100 100)"/>
          </svg>
        </div>
      </div>
    </section>
  `,
  styles: `
    /* ─── Hero ─────────────────────────────────────── */
    .hero {
      background-color: var(--color-bg);
      padding: var(--section-pad) 0 calc(var(--section-pad) * 0.8);
    }

    .hero-inner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: clamp(2rem, 6vw, 5rem);
    }

    .hero-eyebrow {
      font-family: var(--font-ui);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--color-text-muted);
      margin-bottom: 0.6rem;
    }

    .hero-headline {
      font-size: clamp(2.8rem, 6vw, 4.2rem);
      font-weight: 400;
      font-style: italic;
      color: var(--color-dark);
      margin-bottom: 1.2rem;
    }

    .hero-body {
      font-size: 1.1rem;
      line-height: 1.75;
      color: rgba(28,28,28,0.75);
      max-width: 44ch;
      margin-bottom: 2rem;
    }

    .hero-image-wrap {
      display: flex;
      justify-content: center;
    }

    .hero-image-frame {
      position: relative;
      width: clamp(220px, 35vw, 360px);
      aspect-ratio: 1;
    }

    .hero-image-frame::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      box-shadow: 0 20px 60px rgba(28,28,28,0.18),
                  0 0 0 3px var(--color-bg),
                  0 0 0 5px rgba(28,28,28,0.12);
    }

    .hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    /* ─── Books Section ────────────────────────────── */
    .books-section {
      background: var(--color-bg-warm);
      padding: var(--section-pad) 0;
      border-top: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
    }

    .section-title {
      font-size: clamp(2rem, 4vw, 2.8rem);
      color: var(--color-dark);
      margin-bottom: clamp(2rem, 4vw, 3rem);
      font-weight: 400;
    }

    .books-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr));
      gap: clamp(2rem, 4vw, 3.5rem);
    }

    .book-card {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 1.5rem;
      align-items: start;
      background: var(--color-bg);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: 0 2px 16px var(--color-shadow);
      transition: box-shadow var(--transition-slow), transform var(--transition-slow);
    }

    .book-card:hover {
      box-shadow: 0 8px 40px rgba(28,28,28,0.14);
      transform: translateY(-3px);
    }

    .book-card__cover-link { display: block; }

    .book-card__cover {
      width: 100%;
      border-radius: var(--radius-md);
      box-shadow: 0 4px 20px rgba(28,28,28,0.2);
      transition: transform var(--transition-slow);
    }

    .book-card:hover .book-card__cover {
      transform: scale(1.03);
    }

    .book-card__body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .book-card__title {
      font-size: 1.2rem;
      color: var(--color-dark);
      margin: 0;
      font-weight: 400;
    }

    .book-card__desc {
      font-size: 0.9rem;
      line-height: 1.65;
      color: rgba(28,28,28,0.7);
      margin: 0;
      flex: 1;
    }

    /* ─── Contact CTA ───────────────────────────────── */
    .contact-section {
      background: var(--color-bg);
      padding: var(--section-pad) 0;
    }

    .contact-inner {
      display: flex;
      align-items: center;
      gap: 3rem;
    }

    .contact-text { flex: 1; }

    .contact-title {
      font-size: clamp(1.8rem, 3.5vw, 2.5rem);
      font-weight: 400;
      color: var(--color-dark);
      margin-bottom: 1rem;
    }

    .contact-body {
      font-size: 1.05rem;
      color: rgba(28,28,28,0.7);
      max-width: 48ch;
      margin-bottom: 1.75rem;
    }

    .contact-deco {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    /* ─── Responsive ─────────────────────────────────── */
    @media (max-width: 700px) {
      .hero-inner {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .hero-text { order: 2; }
      .hero-image-wrap { order: 1; }

      .hero-body { max-width: 100%; }

      .hero-image-frame {
        width: clamp(160px, 55vw, 240px);
        margin: 0 auto;
      }

      .book-card {
        grid-template-columns: 110px 1fr;
        gap: 1rem;
        padding: 1rem;
      }

      .contact-inner { flex-direction: column; }
      .contact-deco { display: none; }
    }
  `,
})
export default class Home {}
