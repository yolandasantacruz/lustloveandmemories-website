import { Component, ChangeDetectionStrategy, afterNextRender, inject, ViewEncapsulation } from '@angular/core';
import { AsyncPipe, DOCUMENT } from '@angular/common';
import { RouteMeta } from '@analogjs/router';
import { injectContent, MarkdownComponent } from '@analogjs/content';

export interface PrivacyAttributes {
  title: string;
  slug: string;
  description: string;
  lastUpdated: string;
}

export const routeMeta: RouteMeta = {
  title: 'Privacy Policy — Yolanda Santa Cruz',
  meta: [
    {
      name: 'description',
      content: 'Information about how correspondence and privacy are respected on Yolanda Santa Cruz’s website.'
    }
  ]
};

@Component({
  selector: 'app-privacy',
  imports: [AsyncPipe, MarkdownComponent],
  template: `
    <main class="privacy-page">
      <div class="container privacy-inner">
        @if (page$ | async; as page) {
          <article class="privacy-article">
            <div class="privacy-markdown">
              <analog-markdown [content]="page.content" />
            </div>
          </article>
        }
      </div>
    </main>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .privacy-page {
      /* ── Sheet Position & Padding Controls ── */
      /* 1. Distance from the top of the browser / header: */
      --page-top-offset: calc(clamp(7.5rem, 14vh, 10.5rem) + 50px);

      /* 2. Padding inside the white paper sheet: */
      --sheet-padding-top-bottom: clamp(3rem, 6vw, 6rem);  /* Top & bottom inside white page */
      --sheet-padding-sides:      clamp(2rem, 6vw, 6rem);   /* Left & right sides inside white page */

      display: block;
      background: var(--paper);
      color: var(--ink);
      min-height: 100vh;
      padding-top: var(--page-top-offset);
      padding-bottom: clamp(4.5rem, 8vh, 6.5rem);
    }

    .privacy-page .privacy-inner {
      max-width: 1017px;
      margin: 0 auto;
      padding: 0 clamp(1.5rem, 4vw, 3rem); /* Outer margin gutter on narrow screens */
    }

    .privacy-page .privacy-article {
      background: var(--paper-sheet);
      padding: var(--sheet-padding-top-bottom) var(--sheet-padding-sides);
      border-radius: 4px;
      box-shadow: 0 24px 60px -20px rgba(20, 19, 18, 0.08), 0 2px 8px rgba(20, 19, 18, 0.02);
      border: none;
    }

    .privacy-page .privacy-markdown h1 {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(2.1rem, 3.2vw, 2.75rem);
      color: var(--ink);
      line-height: 1.15;
      margin: 0 0 0.5rem;
    }

    .privacy-page .privacy-markdown p > em:first-child {
      display: block;
      color: var(--ink-3);
      font-family: var(--font-serif-italic);
      font-size: 0.88rem;
      margin-bottom: 2.25rem;
    }

    .privacy-page .privacy-markdown hr {
      display: none;
    }

    /* Generous breathing room and double space between topics */
    .privacy-page .privacy-markdown h3 {
      font-family: var(--font-display);
      font-weight: 450;
      font-size: clamp(1.22rem, 1.8vw, 1.45rem);
      color: var(--ink);
      margin-top: clamp(3rem, 6vh, 4.25rem) !important;
      margin-bottom: 1rem !important;
      line-height: 1.3;
    }

    .privacy-page .privacy-markdown p {
      font-family: var(--font-body);
      font-size: 0.94rem;
      line-height: 1.75;
      color: var(--ink-2);
      margin: 0 0 1.35rem;
    }

    /* Bullet list indented closer to the copy border while keeping dots neatly inside */
    .privacy-page .privacy-markdown ul {
      margin: 1rem 0 2.25rem 0 !important;
      padding-left: clamp(1.4rem, 2.8vw, 1.85rem) !important;
      color: var(--ink-2);
      font-size: 0.94rem;
      line-height: 1.75;
      list-style-type: disc !important;
    }

    .privacy-page .privacy-markdown li {
      margin-bottom: 0.8rem;
      padding-left: 0.35rem;
    }

    .privacy-page .privacy-markdown li::marker {
      color: var(--ink-3);
      font-size: 0.85em;
    }

    .privacy-page .privacy-markdown strong {
      color: var(--ink);
      font-weight: 600;
    }

    .privacy-page .privacy-markdown a {
      color: var(--ink-2);
      font-weight: 400;
      text-decoration: none;
      position: relative;
      display: inline-block;
      transition: color var(--dur-fast) ease;
    }

    .privacy-page .privacy-markdown a::after {
      content: '';
      position: absolute;
      bottom: 2px;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--ink);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform var(--dur-med) var(--ease-out);
    }

    .privacy-page .privacy-markdown a:hover,
    .privacy-page .privacy-markdown a:focus-visible {
      color: var(--ink);
    }

    .privacy-page .privacy-markdown a:hover::after,
    .privacy-page .privacy-markdown a:focus-visible::after {
      transform: scaleX(1);
    }
  `
})
export default class PrivacyPageComponent {
  private document = inject(DOCUMENT);
  readonly page$ = injectContent<PrivacyAttributes>({ customFilename: 'privacy' });

  constructor() {
    afterNextRender(() => {
      const win = this.document.defaultView;
      win?.scrollTo({ top: 0, behavior: 'instant' });
      if (this.document.documentElement) {
        this.document.documentElement.scrollTop = 0;
      }
      if (this.document.body) {
        this.document.body.scrollTop = 0;
      }
    });
  }
}
