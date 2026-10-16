import { Component, HostListener, signal, PLATFORM_ID, inject, afterNextRender, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <!-- ─── Navigation ──────────────────────────────── -->
    <header class="site-header" [class.scrolled]="scrolled()" [class.nav--hidden]="navHidden()">
      <div class="nav-inner">
        <a routerLink="/" class="brand" aria-label="Home">
          <span class="brand__title">Yolanda Santa Cruz</span>
        </a>

        <nav class="site-nav" [class.is-open]="menuOpen()">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMenu()">Home</a>
          <span class="nav-sep" aria-hidden="true">·</span>
          <a routerLink="/books" routerLinkActive="active" (click)="closeMenu()">Books</a>
          <span class="nav-sep" aria-hidden="true">·</span>
          <a routerLink="/about" routerLinkActive="active" (click)="closeMenu()">About</a>
        </nav>

        <button class="nav-toggle" (click)="toggleMenu()" [attr.aria-expanded]="menuOpen()" aria-label="Toggle menu">
          <span [class.open]="menuOpen()">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <line x1="3" y1="6" x2="21" y2="6" class="bar-1"/>
              <line x1="3" y1="12" x2="21" y2="12" class="bar-2"/>
              <line x1="3" y1="18" x2="21" y2="18" class="bar-3"/>
            </svg>
          </span>
        </button>
      </div>
    </header>

    <!-- ─── Page Content ─────────────────────────────── -->
    <main class="site-main">
      <router-outlet />
    </main>

    <!-- ─── Footer ───────────────────────────────────── -->
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-grid">
          <div class="footer-col footer-col--brand">
            <span class="footer-brand">Yolanda Santa Cruz</span>
            <p class="footer-tagline text-serif-italic">
              Poet and artist. Exploring love, heartbreak, and quiet healing through intimate verse and typographic art.
            </p>
          </div>

          <div class="footer-col footer-col--inquiry">
            <div class="footer-inquiry-main">
              <p class="footer-text">For readings, collaborations, and press:</p>
              <a
                href="https://www.instagram.com/lustloveandmemories"
                target="_blank"
                rel="noopener"
                class="footer-link"
              >
                &#64;lustloveandmemories
              </a>
            </div>

            <p class="footer-copy">&copy; {{ year }} &middot; All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* ─── Header ────────────────────────────────────── */
    .site-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 200;
      padding: 0;
      transform: translateY(0);
      transition: transform 0.36s cubic-bezier(0.16, 1, 0.3, 1),
                  background var(--dur-med) var(--ease-out),
                  backdrop-filter var(--dur-med) var(--ease-out),
                  box-shadow var(--dur-med) var(--ease-out);
      will-change: transform;
    }

    .site-header.nav--hidden {
      transform: translateY(-100%);
    }

    /* Transparent on top of hero */
    .site-header:not(.scrolled) {
      background: transparent;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border-bottom: none;
      box-shadow: none;
    }

    /* Glassmorphism when scrolled — evident transparency and blur, no dividing line */
    .site-header.scrolled {
      background: rgba(248, 247, 243, 0.70);
      backdrop-filter: blur(16px) saturate(160%);
      -webkit-backdrop-filter: blur(16px) saturate(160%);
      border-bottom: none;
      box-shadow: 0 4px 20px rgba(20, 19, 18, 0.03);
    }

    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 58px;
      gap: 1.5rem;
      width: 100%;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 clamp(1.5rem, 3.5vw, 2.75rem);
    }

    /* ─── Brand ─────────────────────────────────────── */
    .brand {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
      gap: 2px;
      flex-shrink: 0;
    }

    .brand__title {
      font-family: var(--font-display);
      font-size: 0.92rem;
      font-weight: 500;
      font-style: normal;
      color: var(--ink);
      letter-spacing: 0.04em;
    }

    .brand__sub {
      font-family: var(--font-body);
      font-size: 0.6rem;
      font-weight: 400;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--ink-muted);
      opacity: 0.8;
    }

    /* ─── Nav links ──────────────────────────────────── */
    .site-nav {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .nav-sep {
      color: var(--rule);
      font-size: 0.7rem;
      pointer-events: none;
      user-select: none;
      opacity: 0.6;
    }

    .site-nav a {
      font-family: var(--font-body);
      font-size: 0.86rem;
      font-weight: 450;
      letter-spacing: 0.02em;
      text-transform: none;
      color: var(--ink-2);
      padding: 0.25em 0.55em;
      border-radius: 2px;
      transition: color var(--dur-fast) ease;
      position: relative;
    }

    .site-nav a::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0.55em;
      right: 0.55em;
      height: 1px;
      background: var(--ink);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform var(--dur-med) var(--ease-out);
    }

    .site-nav a:hover,
    .site-nav a.active {
      color: var(--ink);
    }

    .site-nav a:hover::after,
    .site-nav a.active::after {
      transform: scaleX(1);
    }

    .nav-ig {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1px solid var(--rule);
      color: var(--ink-soft);
      margin-left: 0.6rem;
      transition: all var(--dur-med) var(--ease-out);
    }

    .nav-ig:hover {
      color: var(--ink);
      border-color: var(--ink);
      background: var(--paper-2);
    }

    /* ─── Hamburger ──────────────────────────────────── */
    .nav-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--ink);
      padding: 0.5rem;
      line-height: 0;
    }

    /* ─── Main ───────────────────────────────────────── */
    .site-main {
      flex: 1;
    }

    /* ─── Footer ─────────────────────────────────────── */
    .site-footer {
      background: var(--paper-2);
      border-top: none;
      padding: clamp(4rem, 7vh, 6rem) 0 clamp(3.5rem, 6vh, 5rem);
      margin-top: auto;
    }

    .footer-inner {
      display: flex;
      flex-direction: column;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
      gap: clamp(2.5rem, 6vw, 6rem);
      align-items: stretch;
    }

    .footer-col {
      display: flex;
      flex-direction: column;
    }

    .footer-col--brand {
      gap: 0.75rem;
    }

    .footer-brand {
      font-family: var(--font-display);
      font-size: 1.45rem;
      font-weight: 400;
      color: var(--ink);
      line-height: 1.15;
      letter-spacing: -0.01em;
    }

    .footer-tagline {
      font-size: 0.92rem;
      color: var(--ink-soft);
      line-height: 1.6;
      margin: 0;
      max-width: 360px;
    }

    .footer-col--inquiry {
      justify-content: space-between;
      gap: 2.25rem;
    }

    .footer-inquiry-main {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .footer-text {
      font-family: var(--font-body);
      font-size: 0.88rem;
      color: var(--ink-soft);
      line-height: 1.5;
      margin: 0;
    }

    .footer-link {
      font-family: var(--font-body);
      font-size: 0.92rem;
      color: var(--ink);
      text-decoration: none;
      border-bottom: 1px solid transparent;
      padding-bottom: 2px;
      width: fit-content;
      transition: border-color var(--dur-fast) ease;
    }
    .footer-link:hover {
      color: var(--ink);
      border-bottom-color: var(--ink);
    }

    .footer-copy {
      font-family: var(--font-body);
      font-size: 0.78rem;
      color: var(--ink-muted);
      margin: 0;
      letter-spacing: 0.04em;
    }

    @media (max-width: 700px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }
      .footer-col--inquiry {
        justify-content: flex-start;
        gap: 2rem;
      }
    }

    /* ─── Mobile ─────────────────────────────────────── */
    @media (max-width: 700px) {
      .nav-toggle { display: flex; }
      .nav-sep    { display: none; }

      .site-nav {
        display: none;
        position: fixed;
        top: 72px;
        left: 0;
        right: 0;
        bottom: 0;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2rem;
        background: rgba(14,12,10,0.97);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
      }

      .site-nav.is-open { display: flex; }

      .site-nav a:not(.nav-ig) {
        font-size: 1.1rem;
        letter-spacing: 0.2em;
        padding: 0.5em 1em;
      }

      .nav-ig { display: none; }
    }
  `,
})
export class App {
  readonly year = new Date().getFullYear();
  readonly scrolled = signal(false);
  readonly navHidden = signal(false);
  readonly menuOpen = signal(false);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private lastScrollY = 0;

  constructor() {
    afterNextRender(() => {
      const windowRef = this.document.defaultView as unknown as {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
      };
      if (!windowRef) return;

      // Initialize dataLayer and gtag function
      const dataLayer = windowRef.dataLayer = windowRef.dataLayer || [];
      windowRef.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        dataLayer.push(arguments);
      };
      windowRef.gtag('js', new Date());
      windowRef.gtag('config', 'G-Q6G685702D');

      // Dynamically load Google Analytics script with a deprioritized fetch priority
      const script = this.document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-Q6G685702D';
      script.setAttribute('fetchpriority', 'low');
      this.document.head.appendChild(script);
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    if (isPlatformBrowser(this.platformId)) {
      const windowRef = this.document.defaultView;
      if (!windowRef) return;
      const currentY = windowRef.scrollY;
      const delta = currentY - this.lastScrollY;

      // Evident glassmorphism blur triggers past top area
      this.scrolled.set(currentY > 20);

      // Do not hide when mobile navigation menu is open
      if (this.menuOpen()) {
        this.navHidden.set(false);
      } else if (currentY <= 60) {
        // At the top of the page, always keep the navbar visible
        this.navHidden.set(false);
      } else if (delta > 6) {
        // Scrolling down -> hide navbar
        this.navHidden.set(true);
      } else if (delta < -6) {
        // Scrolling up -> reveal navbar
        this.navHidden.set(false);
      }

      this.lastScrollY = Math.max(0, currentY);
    }
  }

  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu() { this.menuOpen.set(false); }
}
