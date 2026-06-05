import { Component, HostListener, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <!-- ─── Navigation ──────────────────────────────── -->
    <header class="site-header" [class.scrolled]="scrolled()">
      <div class="nav-inner container">
        <a routerLink="/home" class="brand" aria-label="Home">
          <span class="brand__title">Yolanda Santa Cruz</span>
          <span class="brand__sub">poet &amp; artist</span>
        </a>

        <nav class="site-nav" [class.is-open]="menuOpen()">
          <a routerLink="/home" routerLinkActive="active" (click)="closeMenu()">Home</a>
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
        <div class="footer-brand">
          <p class="footer-name text-heading">Yolanda Santa Cruz</p>
          <p class="footer-tagline">confessional poet &amp; artist</p>
        </div>

        <nav class="footer-nav" aria-label="Footer navigation">
          <a routerLink="/home">Home</a>
          <a routerLink="/books">Books</a>
          <a routerLink="/about">About</a>
          <a href="https://www.instagram.com/lustloveandmemories" target="_blank" rel="noopener">Instagram</a>
        </nav>

        <div class="footer-copy">
          <p>© {{ year }} Yolanda Santa Cruz</p>
          <p class="footer-made">Made with love &amp; poetry</p>
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
      padding: 3rem 0 2.5rem;
    }

    .footer-inner {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 2rem;
    }

    .footer-name {
      font-size: 0.82rem;
      letter-spacing: 0.16em;
      color: var(--parchment);
      margin-bottom: 0.35rem;
    }

    .footer-tagline {
      font-family: var(--font-body);
      font-size: 0.68rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--gold);
      opacity: 0.65;
    }

    .footer-nav {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .footer-nav a {
      font-family: var(--font-body);
      font-size: 0.7rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--text-tertiary);
      transition: color var(--dur-fast) ease;
    }

    .footer-nav a:hover { color: var(--gold); }

    .footer-copy {
      text-align: right;
    }

    .footer-copy p {
      font-family: var(--font-body);
      font-size: 0.7rem;
      color: var(--text-tertiary);
      line-height: 1.6;
    }

    .footer-made {
      font-style: italic;
      color: rgba(201,169,110,0.45) !important;
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

      .footer-inner {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .footer-copy { text-align: center; }

      .footer-nav { flex-direction: row; flex-wrap: wrap; justify-content: center; }
    }
  `,
})
export class App {
  readonly year = new Date().getFullYear();
  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

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
