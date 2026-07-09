import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { injectContent, MarkdownComponent } from '@analogjs/content';

import BookAttributes from '../../book-attributes';

@Component({
  selector: 'app-book',
  imports: [AsyncPipe, MarkdownComponent, RouterLink],
  template: `
    @if (book$ | async; as book) {
      <article class="book-detail">

        <!-- Back link -->
        <div class="container">
          <a routerLink="/books" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            All Books
          </a>
        </div>

        <!-- Hero -->
        <section class="book-hero">
          <div class="container book-hero-inner">
            <div class="book-cover-wrap">
              <img
                class="book-cover"
                [src]="book.attributes.coverImage"
                [alt]="book.attributes.title + ' cover'"
              />
            </div>
            <div class="book-meta">
              <p class="book-meta__label">poetry collection</p>
              <h1 class="book-meta__title">{{ book.attributes.title }}</h1>
              
              <div class="book-meta__markdown">
                <analog-markdown [content]="book.content" />
              </div>

              @if (book.attributes.orderLink) {
                <a [href]="book.attributes.orderLink" target="_blank" rel="noopener" class="btn btn--primary order-btn">
                  Order Book
                </a>
              }
            </div>
          </div>
        </section>



      </article>
    }
  `,
  styles: `
    .book-detail { background: var(--ink); }

    /* ─── Back link ────────────────────────────────── */
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.3em;
      font-family: var(--font-body);
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-secondary);
      padding: calc(72px + 1.25rem) 0 1.25rem;
      transition: color var(--dur-fast) var(--ease-out);
    }

    .back-link:hover { color: var(--gold); }

    /* ─── Hero ──────────────────────────────────────── */
    .book-hero {
      background: var(--surface-2);
      padding: clamp(2rem, 5vw, 4rem) 0 var(--section-v);
      border-bottom: 1px solid var(--border);
    }

    .book-hero-inner {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: clamp(2.5rem, 5vw, 5rem);
    }

    .book-cover-wrap {
      position: relative;
    }

    .book-cover {
      width: 100%;
      border-radius: var(--radius-md);
      box-shadow: 0 16px 56px rgba(28,28,28,0.25), 0 4px 16px rgba(28,28,28,0.12);
      display: block;
    }

    .book-meta { display: flex; flex-direction: column; gap: 0.7rem; }

    .book-meta__label {
      font-family: var(--font-body);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--gold);
      margin: 0;
    }

    .book-meta__title {
      font-family: var(--font-display);
      font-style: italic;
      font-weight: 300;
      font-size: clamp(2rem, 4.5vw, 3.5rem);
      line-height: 1.05;
      color: var(--parchment);
      margin: 0;
    }

    .book-meta__markdown {
      font-size: 1.05rem;
      line-height: 1.75;
      color: var(--text-secondary);
      margin: 0;
      max-width: 54ch;
    }
    
    .book-meta__markdown p { margin-bottom: 1em; }

    .order-btn {
      margin-top: 1rem;
      align-self: flex-start;
    }

    /* ─── Responsive ─────────────────────────────────── */
    @media (max-width: 640px) {
      .book-hero-inner {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .book-cover-wrap {
        max-width: 200px;
        margin: 0 auto;
      }

      .book-meta { align-items: center; }
      .book-meta__desc { max-width: 100%; }
    }
  `,
})
export default class Book {
  readonly book$ = injectContent<BookAttributes>('slug');
}
