import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectContentFiles } from '@analogjs/content';

import BookAttributes from '../../book-attributes';

@Component({
  selector: 'app-books',
  imports: [RouterLink],
  template: `
    <!-- ─── Page Header ──────────────────────────────── -->
    <section class="books-hero">
      <div class="container">
        <p class="books-eyebrow">written works</p>
        <h1 class="books-headline">Books</h1>
        <p class="books-sub">Poetry collections by Yolanda Santa Cruz</p>
      </div>
    </section>

    <!-- ─── Books List ────────────────────────────────── -->
    <section class="books-list">
      <div class="container">
        @for (book of books; track book.attributes.slug) {
          <article class="book-row">
            <a [routerLink]="['/books', book.attributes.slug]" class="book-row__cover-link" aria-label="{{ book.attributes.title }}">
              <img [src]="book.attributes.coverImage" [alt]="book.attributes.title + ' cover'" class="book-row__cover" />
            </a>
            <div class="book-row__body">
              <h2 class="book-row__title">
                <a [routerLink]="['/books', book.attributes.slug]">{{ book.attributes.title }}</a>
              </h2>
              <p class="book-row__desc">{{ book.attributes.description }}</p>
              <div class="book-row__actions">
                <a [routerLink]="['/books', book.attributes.slug]" class="btn btn--outline">Read more</a>
                @if (book.attributes.orderLink) {
                  <a [href]="book.attributes.orderLink" target="_blank" rel="noopener" class="btn btn--dark">Order book</a>
                }
              </div>
            </div>
          </article>
        }
      </div>
    </section>
  `,
  styles: `
    /* ─── Hero ──────────────────────────────────────── */
    .books-hero {
      background: var(--color-bg-warm);
      padding: var(--section-pad) 0 calc(var(--section-pad) * 0.6);
      border-bottom: 1px solid var(--color-border);
    }

    .books-eyebrow {
      font-family: var(--font-ui);
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--color-text-muted);
      margin-bottom: 0.5rem;
    }

    .books-headline {
      font-size: clamp(2.8rem, 6vw, 4rem);
      font-weight: 400;
      color: var(--color-dark);
      margin-bottom: 0.5rem;
    }

    .books-sub {
      font-family: var(--font-ui);
      font-size: 0.95rem;
      color: var(--color-text-muted);
      margin: 0;
    }

    /* ─── Books List ─────────────────────────────────── */
    .books-list {
      padding: var(--section-pad) 0;
    }

    .book-row {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: clamp(2rem, 4vw, 3.5rem);
      align-items: start;
      padding-bottom: calc(var(--section-pad) * 0.9);
      margin-bottom: calc(var(--section-pad) * 0.9);
      border-bottom: 1px solid var(--color-border);
    }

    .book-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .book-row__cover-link { display: block; }

    .book-row__cover {
      width: 100%;
      border-radius: var(--radius-md);
      box-shadow: 0 8px 32px rgba(28,28,28,0.2);
      transition: transform var(--transition-slow), box-shadow var(--transition-slow);
    }

    .book-row__cover-link:hover .book-row__cover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 16px 48px rgba(28,28,28,0.25);
    }

    .book-row__body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-top: 0.5rem;
    }

    .book-row__title {
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 400;
      color: var(--color-dark);
      margin: 0;
    }

    .book-row__title a {
      color: var(--color-dark);
      transition: color var(--transition-base);
    }

    .book-row__title a:hover { color: var(--color-accent); }

    .book-row__desc {
      font-size: 1rem;
      line-height: 1.75;
      color: rgba(28,28,28,0.7);
      margin: 0;
      max-width: 60ch;
    }

    .book-row__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    /* ─── Responsive ─────────────────────────────────── */
    @media (max-width: 640px) {
      .book-row {
        grid-template-columns: 1fr;
      }

      .book-row__cover-link {
        max-width: 200px;
        margin: 0 auto;
      }

      .book-row__body {
        text-align: center;
        align-items: center;
      }
    }
  `,
})
export default class Books {
  readonly books = injectContentFiles<BookAttributes>();
}
