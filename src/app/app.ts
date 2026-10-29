import { Component, HostListener, signal, PLATFORM_ID, inject, afterNextRender, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  template: `
    <!-- ─── Navigation ──────────────────────────────── -->
    <header
      class="site-header"
      [class.scrolled]="scrolled()"
      [class.nav--hidden]="navHidden() && !menuOpen()"
      [class.menu-open]="menuOpen()"
    >
      <div class="nav-inner">
        <a routerLink="/" class="brand" aria-label="Home" (click)="scrollTo('top', $event)">
          <span class="brand__title">Yolanda Santa Cruz</span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="site-nav site-nav--desktop" aria-label="Primary Navigation">
          <a href="#" [class.active]="activeSection() === 'top'" (click)="scrollTo('top', $event)">Home</a>
          <span class="nav-sep" aria-hidden="true">·</span>
          <a href="#works" [class.active]="activeSection() === 'works'" (click)="scrollTo('works', $event)">Books</a>
          <span class="nav-sep" aria-hidden="true">·</span>
          <a href="#author" [class.active]="activeSection() === 'author'" (click)="scrollTo('author', $event)">About</a>
        </nav>

        <button
          class="nav-toggle"
          (click)="toggleMenu()"
          [attr.aria-expanded]="menuOpen()"
          aria-label="Toggle navigation menu"
        >
          <span class="toggle-icon" [class.open]="menuOpen()">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <line x1="3" y1="6" x2="21" y2="6" class="bar-1"/>
              <line x1="3" y1="12" x2="21" y2="12" class="bar-2"/>
              <line x1="3" y1="18" x2="21" y2="18" class="bar-3"/>
            </svg>
          </span>
        </button>
      </div>
    </header>

    <!-- ─── Mobile Sidebar Navigation ───────────────── -->
    <!-- Scrim Backdrop (tap outside to close) -->
    <div
      class="mobile-backdrop"
      [class.is-open]="menuOpen()"
      (click)="closeMenu()"
      aria-hidden="true"
    ></div>

    <!-- Slideout Sidebar (from right to left, takes less than half screen) -->
    <aside
      class="mobile-sidebar"
      [class.is-open]="menuOpen()"
      [attr.aria-hidden]="!menuOpen()"
      aria-label="Mobile Navigation"
    >
      <div class="sidebar-inner">
        <nav class="sidebar-nav">
          <a
            href="#"
            class="sidebar-link"
            [class.active]="activeSection() === 'top'"
            (click)="scrollTo('top', $event)"
          >Home</a>
          <a
            href="#works"
            class="sidebar-link"
            [class.active]="activeSection() === 'works'"
            (click)="scrollTo('works', $event)"
          >Books</a>
          <a
            href="#author"
            class="sidebar-link"
            [class.active]="activeSection() === 'author'"
            (click)="scrollTo('author', $event)"
          >About</a>
        </nav>
      </div>
    </aside>

    <!-- ─── Page Content ─────────────────────────────── -->
    <main class="site-main">
      <router-outlet />
    </main>

    <!-- ─── Footer ───────────────────────────────────── -->
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-row">
          <p class="footer-copy">
            <span class="footer-copy__author">&copy; {{ year }}, Yolanda Santa Cruz</span>
            <span class="footer-sep" aria-hidden="true">&middot;</span>
            <span class="footer-copy__rights">All rights reserved</span>
          </p>

          <div class="footer-links">
            <a
              href="https://www.instagram.com/lustloveandmemories"
              target="_blank"
              rel="noopener"
              class="footer-link"
              aria-label="Instagram @lustloveandmemories"
            >
              <svg class="footer-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>&#64;lustloveandmemories</span>
            </a>
            <span class="footer-sep" aria-hidden="true">&middot;</span>
            <a
              routerLink="/privacy"
              (click)="onPrivacyClick($event)"
              class="footer-link"
            ><span>Privacy</span></a>
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
      z-index: 230;
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
      transition: opacity var(--dur-med) var(--ease-out);
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
      opacity: 0.5;
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
      z-index: 202;
    }

    .nav-toggle .toggle-icon {
      display: block;
      line-height: 0;
    }

    .nav-toggle .bar-1,
    .nav-toggle .bar-2,
    .nav-toggle .bar-3 {
      transform-origin: center;
      transition: transform 0.26s cubic-bezier(0.16, 1, 0.3, 1),
                  opacity 0.2s ease;
    }

    .nav-toggle .toggle-icon.open .bar-1 {
      transform: translateY(6px) rotate(45deg);
    }

    .nav-toggle .toggle-icon.open .bar-2 {
      opacity: 0;
    }

    .nav-toggle .toggle-icon.open .bar-3 {
      transform: translateY(-6px) rotate(-45deg);
    }

    /* ─── Mobile Sidebar & Backdrop ──────────────────── */
    .mobile-backdrop {
      display: none;
    }

    .mobile-sidebar {
      display: none;
    }

    /* ─── Main ───────────────────────────────────────── */
    .site-main {
      flex: 1;
    }

    /* ─── Footer ─────────────────────────────────────── */
    .site-footer {
      background: var(--paper-2);
      border-top: 1px solid var(--rule-soft);
      padding: clamp(2.25rem, 4vh, 3.25rem) 0;
      margin-top: auto;
    }

    .footer-inner {
      display: flex;
      flex-direction: column;
    }

    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .footer-copy {
      display: inline-flex;
      align-items: center;
      gap: 0.9rem;
      font-family: var(--font-body);
      font-size: 0.84rem;
      color: var(--ink-3);
      margin: 0;
      letter-spacing: 0.02em;
    }

    .footer-copy__author,
    .footer-copy__rights {
      white-space: nowrap;
    }

    .footer-links {
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }

    .footer-link {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-family: var(--font-body);
      font-size: 0.84rem;
      color: var(--ink-2);
      text-decoration: none;
      transition: color var(--dur-fast) ease;
    }

    .footer-link span {
      position: relative;
      display: inline-block;
    }

    .footer-link span::after {
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

    .footer-icon {
      opacity: 0.75;
      transition: opacity var(--dur-fast) ease;
    }

    .footer-link:hover,
    .footer-link:focus-visible {
      color: var(--ink);
    }

    .footer-link:hover .footer-icon,
    .footer-link:focus-visible .footer-icon {
      opacity: 1;
    }

    .footer-link:hover span::after,
    .footer-link:focus-visible span::after {
      transform: scaleX(1);
    }

    .footer-sep {
      color: var(--ink-muted);
      font-size: 0.84rem;
      user-select: none;
      opacity: 0.5;
    }

    @media (max-width: 700px) {
      .site-footer {
        padding: clamp(2.25rem, 5vh, 2.75rem) 0 2rem;
      }

      .footer-row {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1.25rem;
      }

      .footer-copy {
        flex-direction: column;
        gap: 0.35rem;
      }

      .footer-copy .footer-sep {
        display: none;
      }

      .footer-copy__author {
        color: var(--ink-2);
        font-size: 0.88rem;
      }

      .footer-copy__rights {
        color: var(--ink-muted);
        font-size: 0.78rem;
        letter-spacing: 0.04em;
      }

      .footer-links {
        justify-content: center;
        gap: 1.1rem;
        flex-wrap: wrap;
      }

      .footer-link {
        padding: 0.25rem 0.35rem;
      }
    }

    /* ─── Mobile ─────────────────────────────────────── */
    @media (max-width: 700px) {
      .nav-toggle { display: flex; }
      .nav-sep    { display: none; }
      .site-nav--desktop { display: none; }

      /* Smoothly fade out the top navigation bar when mobile menu is open */
      .site-header.menu-open {
        background: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        box-shadow: none !important;
      }

      .site-header.menu-open .brand {
        opacity: 0;
        pointer-events: none;
      }

      .mobile-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 210;
        background: rgba(20, 19, 18, 0.25);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 0.32s var(--ease-out), visibility 0.32s;
      }

      .mobile-backdrop.is-open {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }

      .mobile-sidebar {
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: clamp(170px, 45vw, 215px);
        max-width: 47vw;
        height: 100vh;
        height: 100dvh;
        z-index: 220;
        background: rgba(248, 247, 243, 0.96);
        backdrop-filter: blur(24px) saturate(160%);
        -webkit-backdrop-filter: blur(24px) saturate(160%);
        border-left: 1px solid var(--rule);
        box-shadow: -10px 0 35px rgba(20, 19, 18, 0.10);
        transform: translateX(100%);
        visibility: hidden;
        pointer-events: none;
        transition: transform 0.34s cubic-bezier(0.16, 1, 0.3, 1),
                    visibility 0.34s;
        will-change: transform;
        overflow-y: auto;
        overscroll-behavior: contain;
      }

      .mobile-sidebar.is-open {
        transform: translateX(0);
        visibility: visible;
        pointer-events: auto;
      }

      .sidebar-inner {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 5rem 1.25rem 2.5rem 1.5rem;
      }

      .sidebar-nav {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 1.25rem;
      }

      .sidebar-link {
        font-family: var(--font-body);
        font-size: 1.15rem;
        font-weight: 450;
        letter-spacing: 0.02em;
        text-transform: none;
        color: var(--ink-2);
        padding: 0.35rem 0.55rem;
        border-radius: 2px;
        transition: color var(--dur-fast) ease;
        position: relative;
        text-decoration: none;
        display: inline-block;
      }

      .sidebar-link::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0.55rem;
        right: 0.55rem;
        height: 1px;
        background: var(--ink);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform var(--dur-med) var(--ease-out);
      }

      .sidebar-link:hover,
      .sidebar-link.active {
        color: var(--ink);
      }

      .sidebar-link:hover::after,
      .sidebar-link.active::after {
        transform: scaleX(1);
      }
    }
  `,
})
export class App {
  readonly year = new Date().getFullYear();
  readonly scrolled = signal(false);
  readonly navHidden = signal(false);
  readonly menuOpen = signal(false);
  readonly activeSection = signal<'top' | 'works' | 'author' | null>(null);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private router = inject(Router);
  private lastScrollY = 0;

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.navHidden.set(false);
        this.closeMenu();

        const url = event.urlAfterRedirects || event.url;
        const isHome = url === '/' || url === '' || url.startsWith('/#') || url.startsWith('/?');
        if (!isHome) {
          this.activeSection.set(null);
        } else {
          this.activeSection.set('top');
        }

        if (isPlatformBrowser(this.platformId)) {
          const win = this.document.defaultView;
          win?.scrollTo({ top: 0, behavior: 'instant' });
          if (this.document.documentElement) {
            this.document.documentElement.scrollTop = 0;
          }
          if (this.document.body) {
            this.document.body.scrollTop = 0;
          }
        }
      });

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

      // Verify initial route to set neutral navigation on non-home pages
      const win = this.document.defaultView;
      if (win && win.location.pathname !== '/') {
        this.activeSection.set(null);
      }
    });
  }

  onPrivacyClick(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.closeMenu();
    this.navHidden.set(false);
    this.scrolled.set(false);

    const performTopScroll = () => {
      if (isPlatformBrowser(this.platformId)) {
        const win = this.document.defaultView;
        win?.scrollTo({ top: 0, behavior: 'instant' });
        if (this.document.documentElement) {
          this.document.documentElement.scrollTop = 0;
        }
        if (this.document.body) {
          this.document.body.scrollTop = 0;
        }
      }
    };

    performTopScroll();

    this.router.navigateByUrl('/privacy').then((success) => {
      performTopScroll();
      if (!success && isPlatformBrowser(this.platformId)) {
        const win = this.document.defaultView;
        if (win && win.location.pathname !== '/privacy') {
          win.location.href = '/privacy';
        }
      }
    }).catch(() => {
      if (isPlatformBrowser(this.platformId)) {
        const win = this.document.defaultView;
        if (win) {
          win.location.href = '/privacy';
        }
      }
    });
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    if (this.menuOpen()) {
      this.closeMenu();
    }
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

      // Only perform in-page section highlighting when on the home page
      const currentPath = windowRef.location.pathname;
      if (currentPath !== '/') {
        this.activeSection.set(null);
        return;
      }

      // Smooth section highlighting based on scroll position
      const worksEl = this.document.getElementById('works');
      const authorEl = this.document.getElementById('author');
      const worksTop = worksEl ? worksEl.offsetTop - 180 : Infinity;
      const authorTop = authorEl ? authorEl.offsetTop - 180 : Infinity;

      if (currentY >= authorTop) {
        this.activeSection.set('author');
      } else if (currentY >= worksTop) {
        this.activeSection.set('works');
      } else {
        this.activeSection.set('top');
      }
    }
  }

  scrollTo(targetId: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.closeMenu();
    if (!isPlatformBrowser(this.platformId)) return;

    const windowRef = this.document.defaultView;
    const currentPath = windowRef?.location.pathname;

    const performScroll = () => {
      if (targetId === 'top') {
        windowRef?.scrollTo({ top: 0, behavior: 'smooth' });
        this.activeSection.set('top');
      } else {
        const el = this.document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          this.activeSection.set(targetId as 'works' | 'author');
        }
      }
    };

    if (currentPath && currentPath !== '/') {
      this.router.navigateByUrl('/').then(() => {
        setTimeout(performScroll, 120);
      });
    } else {
      performScroll();
    }
  }

  toggleMenu() {
    this.menuOpen.update(v => {
      const next = !v;
      this.syncBodyScrollLock(next);
      return next;
    });
  }

  closeMenu() {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
      this.syncBodyScrollLock(false);
    }
  }

  private syncBodyScrollLock(lock: boolean) {
    if (!isPlatformBrowser(this.platformId)) return;
    const body = this.document.body;
    if (body) {
      body.style.overflow = lock ? 'hidden' : '';
    }
  }
}

