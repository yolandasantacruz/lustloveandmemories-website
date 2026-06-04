import { Component, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { injectContentFiles } from '@analogjs/content';

import BookAttributes from '../../book-attributes';

@Component({
  selector: 'app-books',
  imports: [RouterLink],
  template: `
    <!-- ═══ HERO ═══════════════════════════════════════════════ -->
    <section class="books-hero">
      <div class="books-hero__bg" aria-hidden="true">
        <div class="books-hero__pattern"></div>
      </div>
      <div class="container books-hero__content">
        <div class="reveal">
          <p class="text-label">Written Works</p>
          <h1 class="books-hero__title">
            <em>Books</em>
          </h1>
          <p class="books-hero__sub">Poetry collections by Yolanda Santa Cruz</p>
        </div>
      </div>
    </section>

    <!-- ═══ BOOKS LIST ════════════════════════════════════════ -->
    <div class="books-list">
      @for (book of books; track book.attributes.slug; let i = $index) {
        <article class="book-row reveal" [class.book-row--alt]="i % 2 !== 0">

          <div class="book-row__cover-col">
            <a [routerLink]="['/books', book.attributes.slug]"
               class="book-row__cover-wrap"
               [attr.aria-label]="'Read more about ' + book.attributes.title">
              <img [src]="book.attributes.coverImage"
                   [alt]="book.attributes.title + ' cover'"
                   class="book-row__cover"
                   loading="lazy" />
              <div class="book-row__cover-shadow"></div>
            </a>
          </div>

          <div class="book-row__text">
            <p class="text-label book-row__vol">Vol. {{ i + 1 }}</p>
            <h2 class="book-row__title">
              <a [routerLink]="['/books', book.attributes.slug]">{{ book.attributes.title }}</a>
            </h2>
            <div class="divider" style="margin: 1.25rem 0"></div>
            <p class="book-row__desc">{{ book.attributes.description }}</p>
            <div class="book-row__actions">
              <a [routerLink]="['/books', book.attributes.slug]" class="btn btn--ghost-light">Read more</a>
              @if (book.attributes.orderLink) {
                <a [href]="book.attributes.orderLink" target="_blank" rel="noopener" class="btn btn--gold">Order Book</a>
              }
            </div>
          </div>

        </article>
      }
    </div>

    <!-- ═══ CONTACT CTA ═══════════════════════════════════════ -->
    <section class="books-contact">
      <div class="container books-contact-inner reveal">
        <p class="text-label">Connect</p>
        <p class="books-contact__text">
          Find Yolanda on Instagram at
          <a href="https://www.instagram.com/lustloveandmemories" target="_blank" rel="noopener" class="ig-link">
            &#64;lustloveandmemories
          </a>
        </p>
      </div>
    </section>
  `,
  styles: `
    /* ═══ HERO ══════════════════════════════════════════════════ */
    .books-hero {
      position: relative;
      padding: clamp(6rem, 14vw, 10rem) 0 clamp(3rem, 6vw, 5rem);
      border-bottom: 1px solid var(--border);
      overflow: hidden;
    }

    .books-hero__bg {
      position: absolute;
      inset: 0;
      background: var(--surface);
    }

    .books-hero__pattern {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(201,169,110,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(201,169,110,0.04) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse 60% 70% at 50% 50%, black, transparent);
    }

    .books-hero__content {
      position: relative;
      z-index: 1;
    }

    .books-hero__title {
      font-family: var(--font-display);
      font-style: italic;
      font-weight: 300;
      font-size: clamp(4rem, 10vw, 8rem);
      line-height: 0.9;
      color: var(--parchment);
      margin: 0.5rem 0 1rem;
    }

    .books-hero__sub {
      font-family: var(--font-body);
      font-size: 0.88rem;
      font-weight: 300;
      letter-spacing: 0.06em;
      color: var(--text-tertiary);
    }

    /* ═══ BOOKS LIST ════════════════════════════════════════════ */
    .books-list {
      background: var(--ink);
    }

    .book-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: clamp(420px, 60vh, 640px);
      border-bottom: 1px solid var(--border);
    }

    .book-row--alt { direction: rtl; }
    .book-row--alt > * { direction: ltr; }

    .book-row__cover-col {
      position: relative;
      overflow: hidden;
      background: var(--surface-2);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(3rem, 6vw, 5rem);
    }

    .book-row__cover-wrap {
      display: block;
      position: relative;
      max-width: 280px;
      width: 100%;
    }

    .book-row__cover {
      width: 100%;
      border-radius: 2px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.6);
      transition: transform var(--dur-slow) var(--ease-out),
                  box-shadow var(--dur-slow) var(--ease-out);
      position: relative;
      z-index: 1;
    }

    .book-row__cover-wrap:hover .book-row__cover {
      transform: translateY(-10px) rotate(-1.5deg);
      box-shadow: 0 40px 100px rgba(0,0,0,0.65);
    }

    .book-row__cover-shadow {
      position: absolute;
      bottom: -16px;
      left: 5%;
      right: 5%;
      height: 30px;
      background: radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%);
      filter: blur(8px);
      transition: transform var(--dur-slow) var(--ease-out);
    }

    .book-row__cover-wrap:hover .book-row__cover-shadow {
      transform: scaleX(0.8) translateY(10px);
    }

    .book-row__text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: clamp(2.5rem, 5vw, 5rem);
      background: var(--ink);
    }

    .book-row__vol { margin-bottom: 0.75rem; }

    .book-row__title {
      font-family: var(--font-display);
      font-style: italic;
      font-weight: 300;
      font-size: clamp(1.8rem, 3.5vw, 3rem);
      line-height: 1.05;
      color: var(--parchment);
      margin: 0;
    }

    .book-row__title a {
      color: inherit;
      transition: color var(--dur-fast) ease;
    }

    .book-row__title a:hover { color: var(--gold-light); }

    .book-row__desc {
      font-family: var(--font-body);
      font-size: 0.92rem;
      font-weight: 300;
      line-height: 1.8;
      color: var(--text-secondary);
      max-width: 50ch;
    }

    .book-row__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.875rem;
      margin-top: 1rem;
    }

    /* ═══ CONTACT ════════════════════════════════════════════ */
    .books-contact {
      background: var(--ink-soft);
      border-top: 1px solid var(--border);
      padding: 3rem 0;
    }

    .books-contact-inner {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .books-contact__text {
      font-family: var(--font-body);
      font-size: 0.88rem;
      font-weight: 300;
      color: var(--text-secondary);
    }

    .ig-link {
      color: var(--gold);
      border-bottom: 1px solid rgba(201,169,110,0.35);
      padding-bottom: 0.05em;
      transition: all var(--dur-fast) ease;
    }
    .ig-link:hover {
      color: var(--gold-light);
      border-color: var(--gold-light);
    }

    /* ═══ RESPONSIVE ══════════════════════════════════════════ */
    @media (max-width: 768px) {
      .book-row {
        grid-template-columns: 1fr;
        direction: ltr !important;
        min-height: auto;
      }

      .book-row__cover-col {
        padding: 3rem 2rem;
        min-height: 360px;
      }

      .book-row__text { padding: 2.5rem 1.5rem; }
    }
  `,
})
export default class Books implements AfterViewInit {
  readonly books = injectContentFiles<BookAttributes>();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    document.querySelectorAll('.books-hero .reveal').forEach(el => el.classList.add('visible'));

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.08 }
    );

    document.querySelectorAll('.books-list .reveal, .books-contact .reveal')
      .forEach(el => observer.observe(el));
  }
}
