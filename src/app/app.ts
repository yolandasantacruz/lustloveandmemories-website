import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <!-- ─── Navigation ─────────────────────────────── -->
    <header class="site-header" [class.scrolled]="scrolled()">
      <div class="nav-inner container">
        <a routerLink="/" class="brand" aria-label="Home">
          <span class="brand__title">Yolanda Santa Cruz</span>
          <span class="brand__sub">poet &amp; artist</span>
        </a>

        <button class="nav-toggle" (click)="toggleMenu()" [attr.aria-expanded]="menuOpen()" aria-label="Toggle navigation">
          <span class="nav-toggle__bar"></span>
          <span class="nav-toggle__bar"></span>
          <span class="nav-toggle__bar"></span>
        </button>

        <nav class="site-nav" [class.is-open]="menuOpen()">
          <a routerLink="/home" routerLinkActive="active" (click)="closeMenu()">Home</a>
          <a routerLink="/books" routerLinkActive="active" (click)="closeMenu()">Books</a>
          <a routerLink="/about" routerLinkActive="active" (click)="closeMenu()">About Me</a>
        </nav>
      </div>
    </header>

    <!-- ─── Page Content ───────────────────────────── -->
    <main class="site-main">
      <router-outlet />
    </main>

    <!-- ─── Footer ─────────────────────────────────── -->
    <footer class="site-footer">
      <div class="container footer-inner">
        <p class="footer__copy">© {{ year }} Yolanda Santa Cruz · Made with love</p>
        <a href="https://www.instagram.com/lustloveandmemories" target="_blank" rel="noopener" class="footer__ig" aria-label="Instagram">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>
          </svg>
          &#64;lustloveandmemories
        </a>
      </div>
    </footer>
  `,
  styles: `
    /* ─── Header ─────────────────────────────────────── */
    .site-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--color-nav-bg);
      transition: box-shadow var(--transition-base);
    }

    .site-header.scrolled {
      box-shadow: 0 2px 24px rgba(0,0,0,0.3);
    }

    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 68px;
      gap: 1rem;
    }

    /* ─── Brand ──────────────────────────────────────── */
    .brand {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
      gap: 0;
      text-decoration: none;
    }

    .brand__title {
      font-family: var(--font-serif);
      font-size: 1.2rem;
      font-weight: 400;
      color: var(--color-nav-text);
      letter-spacing: 0.01em;
    }

    .brand__sub {
      font-family: var(--font-ui);
      font-size: 0.65rem;
      font-weight: 300;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(249,249,249,0.55);
    }

    /* ─── Nav links ──────────────────────────────────── */
    .site-nav {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .site-nav a {
      font-family: var(--font-ui);
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(249,249,249,0.75);
      padding: 0.4em 0.9em;
      border-radius: var(--radius-full);
      transition: color var(--transition-base), background var(--transition-base);
    }

    .site-nav a:hover,
    .site-nav a.active {
      color: #fff;
      background: rgba(255,255,255,0.1);
    }

    /* ─── Hamburger ──────────────────────────────────── */
    .nav-toggle {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 36px;
      height: 36px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
    }

    .nav-toggle__bar {
      display: block;
      width: 100%;
      height: 2px;
      background: var(--color-nav-text);
      border-radius: 2px;
      transition: transform var(--transition-base), opacity var(--transition-base);
    }

    /* ─── Main ───────────────────────────────────────── */
    .site-main {
      flex: 1;
    }

    /* ─── Footer ─────────────────────────────────────── */
    .site-footer {
      background: var(--color-nav-bg);
      color: rgba(249,249,249,0.6);
      padding: 1.5rem 0;
    }

    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .footer__copy {
      font-family: var(--font-ui);
      font-size: 0.78rem;
      margin: 0;
    }

    .footer__ig {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-family: var(--font-ui);
      font-size: 0.78rem;
      color: rgba(249,249,249,0.6);
      transition: color var(--transition-base);
    }

    .footer__ig:hover { color: #fff; }

    /* ─── Mobile nav ─────────────────────────────────── */
    @media (max-width: 640px) {
      .nav-toggle { display: flex; }

      .site-nav {
        display: none;
        position: absolute;
        top: 68px;
        left: 0;
        right: 0;
        flex-direction: column;
        align-items: stretch;
        background: var(--color-nav-bg);
        padding: 0.75rem 1rem 1.25rem;
        gap: 0.25rem;
        border-top: 1px solid rgba(255,255,255,0.08);
      }

      .site-nav.is-open { display: flex; }

      .site-nav a {
        padding: 0.7em 1em;
        border-radius: var(--radius-md);
      }
    }
  `,
})
export class App {
  readonly year = new Date().getFullYear();
  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 10);
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}
