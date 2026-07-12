import { Component, HostListener, signal, PLATFORM_ID, inject, afterNextRender } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <!-- ─── Navigation ──────────────────────────────── -->
    <header class="site-header" [class.scrolled]="scrolled()">
      <div class="nav-inner container">
        <a routerLink="/" class="brand" aria-label="Home">
          <span class="brand__title">Yolanda Santa Cruz</span>
          <span class="brand__sub">poet &amp; artist</span>
        </a>

        <nav class="site-nav" [class.is-open]="menuOpen()">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMenu()">Home</a>
          <span class="nav-sep" aria-hidden="true">·</span>
          <a routerLink="/books" routerLinkActive="active" (click)="closeMenu()">Books</a>
          <span class="nav-sep" aria-hidden="true">·</span>
          <a routerLink="/about" routerLinkActive="active" (click)="closeMenu()">About</a>
          <a href="https://www.instagram.com/lustloveandmemories" target="_blank" rel="noopener" class="nav-ig" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
            </svg>
          </a>
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
        <div class="footer-copy">
          <p>© {{ year }} Yolanda Santa Cruz</p>
        </div>
      </div>
    </footer>
  `,
  styles: `
    /* ─── Header ────────────────────────────────────── */
    .site-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 200;
      padding: 0;
      transition: background var(--dur-med) var(--ease-out),
                  backdrop-filter var(--dur-med) var(--ease-out),
                  box-shadow var(--dur-med) var(--ease-out);
    }

    /* Transparent on top of hero */
    .site-header:not(.scrolled) {
      background: transparent;
      backdrop-filter: none;
    }

    /* Glassmorphism when scrolled */
    .site-header.scrolled {
      background: rgba(14, 12, 10, 0.72);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(201, 169, 110, 0.12);
      box-shadow: 0 4px 32px rgba(0,0,0,0.4);
    }

    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
      gap: 2rem;
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
      font-size: 1.15rem;
      font-weight: 400;
      font-style: italic;
      color: var(--parchment);
      letter-spacing: 0.01em;
    }

    .brand__sub {
      font-family: var(--font-body);
      font-size: 0.6rem;
      font-weight: 400;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--gold);
      opacity: 0.8;
    }

    /* ─── Nav links ──────────────────────────────────── */
    .site-nav {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .nav-sep {
      color: rgba(201,169,110,0.3);
      font-size: 0.8rem;
      pointer-events: none;
      user-select: none;
    }

    .site-nav a:not(.nav-ig) {
      font-family: var(--font-body);
      font-size: 0.72rem;
      font-weight: 400;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--text-secondary);
      padding: 0.35em 0.7em;
      border-radius: 2px;
      transition: color var(--dur-fast) ease;
      position: relative;
    }

    .site-nav a:not(.nav-ig)::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0.7em;
      right: 0.7em;
      height: 1px;
      background: var(--gold);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform var(--dur-med) var(--ease-out);
    }

    .site-nav a:not(.nav-ig):hover,
    .site-nav a:not(.nav-ig).active {
      color: var(--parchment);
    }

    .site-nav a:not(.nav-ig):hover::after,
    .site-nav a:not(.nav-ig).active::after {
      transform: scaleX(1);
    }

    .nav-ig {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      margin-left: 0.6rem;
      transition: all var(--dur-med) var(--ease-out);
    }

    .nav-ig:hover {
      color: var(--gold);
      border-color: var(--gold);
      background: var(--gold-dim);
    }

    /* ─── Hamburger ──────────────────────────────────── */
    .nav-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--parchment);
      padding: 0.5rem;
      line-height: 0;
    }

    /* ─── Main ───────────────────────────────────────── */
    .site-main {
      flex: 1;
    }

    /* ─── Footer ─────────────────────────────────────── */
    .site-footer {
      background: var(--ink-soft);
      border-top: 1px solid var(--border);
      padding: 2rem 0;
    }

    .footer-inner {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .footer-copy {
      text-align: center;
    }

    .footer-copy p {
      font-family: var(--font-body);
      font-size: 0.7rem;
      color: var(--text-secondary);
      line-height: 1.6;
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
  readonly menuOpen = signal(false);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

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
      this.scrolled.set(windowRef ? windowRef.scrollY > 60 : false);
    }
  }

  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu() { this.menuOpen.set(false); }
}
