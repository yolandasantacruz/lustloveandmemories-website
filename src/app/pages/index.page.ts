import {
  Component,
  ElementRef,
  viewChild,
  signal,
  inject,
  PLATFORM_ID,
  afterNextRender,
  ChangeDetectionStrategy,
  DestroyRef
} from '@angular/core';
import { isPlatformBrowser, DOCUMENT, NgOptimizedImage } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import {
  initLetterSea,
  initHeroFigure,
  initRevealingPoem,
  CURATED_POEMS,
  initWalkingFigure,
  WalkingFigureHandle,
  setupLiveLetters
} from '../literary-art';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ═══ AMBIENT OCEAN OF LETTERS (GLOBAL BACKGROUND) ════════════════ -->
    <canvas #seaCanvas class="global-sea-canvas" aria-hidden="true"></canvas>

    <!-- ═══ 1. HERO — POETIC LEAD ═══════════════════════════════════════ -->
    <section class="hero" #heroSection aria-labelledby="heroTitle">
      <div class="hero-spotlight" aria-hidden="true"></div>

      <div class="container hero-container">
        <div class="hero-lead">
          <span class="kicker text-sc">Two Poetry Collections</span>
          <h1 id="heroTitle" class="hero-headline live">
            &ldquo;Whenever I want to write you, I write me.&rdquo;
          </h1>
          <p class="hero-sub text-serif-italic">
            Poetry on desire, grief, and surviving the quiet hours.
          </p>
          <div class="hero-actions">
            <a href="#works" class="btn">Explore Collections</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ 2. PUBLISHED COLLECTIONS (SEQUENTIAL EDITORIAL SHOWCASE) ══ -->
    <section class="sec works-section" id="works" aria-labelledby="worksH">
      <div class="container center-head">
        <span class="kicker text-sc">Published Collections</span>
        <h2 id="worksH" class="sec-title live">The Books</h2>
        <p class="sec-desc text-serif-italic">
          Two companion volumes exploring romantic desire, loss, and survival.
        </p>
      </div>

      <div class="container books-sequential">
        <!-- Book 1: Lust, Love, and Memories -->
        <article class="book-feature">
          <div class="book-feature__cover">
            <a href="https://www.amazon.com/dp/1736494805" target="_blank" rel="noopener" class="book-cover-anchor">
              <img
                ngSrc="images/book-lust-love-memories.webp"
                ngSrcset="400w, 800w, 1200w"
                sizes="(max-width: 768px) 100vw, 380px"
                width="1200"
                height="1386"
                alt="Lust, Love, and Memories book cover"
                class="book-img"
                loading="lazy"
              />
            </a>
          </div>
          <div class="book-feature__content">
            <span class="book-vol-tag text-sc">Volume I</span>
            <h3 class="book-title live">
              Lust, Love, and Memories
            </h3>
            <p class="book-desc">
              A compilation of poems focusing on all stages of romantic relationships, from the desire and excitement felt at the very beginning to the quiet aftermath that follows. Each piece captures an emotional landscape of longing, connection, and honest survival.
            </p>
            <div class="book-links">
              <a href="https://www.amazon.com/dp/1736494805" target="_blank" rel="noopener" class="btn">Order Book</a>
            </div>
          </div>
        </article>

        <!-- Book 2: The Longest Nights -->
        <article class="book-feature book-feature--alt">
          <div class="book-feature__cover">
            <a href="https://www.amazon.com/dp/1736494821" target="_blank" rel="noopener" class="book-cover-anchor">
              <img
                ngSrc="images/book-longest-nights.webp"
                ngSrcset="400w, 800w, 1200w"
                sizes="(max-width: 768px) 100vw, 380px"
                width="1200"
                height="1369"
                alt="The Longest Nights book cover"
                class="book-img"
                loading="lazy"
              />
            </a>
          </div>
          <div class="book-feature__content">
            <span class="book-vol-tag text-sc">Volume II</span>
            <h3 class="book-title live">
              The Longest Nights
            </h3>
            <p class="book-desc">
              Dissects the grieving we go through after romantic loss, with each chapter dedicated to the five stages of grief. Encounter poems that move from denial of the present to the acceptance that comes only after making peace with the past.
            </p>
            <div class="book-links">
              <a href="https://www.amazon.com/dp/1736494821" target="_blank" rel="noopener" class="btn">Order Book</a>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- ═══ 4. THE AUTHOR (MINIMALIST LITERARY STATEMENT) ═══════════════ -->
    <section class="sec author-section" id="author" aria-labelledby="authorH">
      <div class="container author-grid">
        <div class="author-photo-wrap">
          <img
            ngSrc="images/yolanda-portrait.webp"
            ngSrcset="400w, 800w, 1200w"
            sizes="(max-width: 768px) 100vw, 400px"
            width="768"
            height="1024"
            alt="Portrait of Yolanda Santa Cruz"
            class="author-photo"
            loading="lazy"
          />
        </div>

        <div class="author-text">
          <span class="kicker text-sc">The Author</span>
          <h2 id="authorH" class="sec-title live">
            Behind the Verse
          </h2>
          <div class="author-statement">
            <p class="author-summary">
              Art is approached as a catalyst that heals and uplifts both creator and reader. Rooted in personal memory, the poetry explores moments where emotion demanded quiet honesty—balancing raw confessional intimacy with the visual architecture of words on paper.
            </p>
            <p class="author-details">
              Awarded first place at the University of Talarrubias poetry contest, merit honors at the XVII Castello di Duino International Competition, and published in literary reviews including <em>Revista Literaria Visor</em> and <em>Carpa de Sueños</em>.
            </p>
            <div class="author-meta">
              <a routerLink="/about" class="text-link">Biography &amp; Publications</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ 5. SHAPES IN TEXT (TRANSPARENT TYPOGRAPHIC SILHOUETTES) ═════ -->
    <section class="sec shapes-section" id="shapes" aria-labelledby="shapesH" #shapesSection>
      <div class="container shapes-grid">
        <div class="shapes-copy">
          <span class="kicker text-sc">Metamorphosis</span>
          <h2 id="shapesH" class="sec-title live">Shapes in text</h2>
          <p class="shapes-main">
            Letters gathering into silhouettes shaped by memory.
          </p>
          <p class="shapes-sub text-serif-italic" #figCaption aria-live="polite">
            Tap the figure to rearrange its verses.
          </p>
        </div>

        <div class="shapes-canvas-col">
          <div class="shapes-frame">
            <canvas #figCanvas class="fig-canvas" aria-hidden="true"></canvas>
            <button #figBtn type="button" class="fig-btn" aria-label="Rearrange letters into a new figure"></button>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ 6. UNCOVER THE POEM (ATMOSPHERIC REVEALING POETRY CANVAS) ══ -->
    <section class="sec reveal-section" id="poetry" aria-labelledby="revealH">
      <div class="container center-head">
        <span class="kicker text-sc">Poetry</span>
        <h2 id="revealH" class="sec-title live">Uncover the Poem</h2>
        <p class="sec-desc text-serif-italic">
          Move your mouse over to uncover the letters.
        </p>
      </div>

      <div class="container">
        <div class="reveal-wrap">
          <canvas #revealCanvas class="reveal-canvas" aria-hidden="true"></canvas>
          <p class="sr-only">
            Whenever I want to write you, I write me. — How My Poems Are Created · Lust, Love, and Memories.
            Some flowers get killed before they get their chance to flourish. — Unflourished · The Longest Nights.
            Enter, come in, you are welcomed. I want to break free, the only way of doing so is opening the door. — Entry as Exit · The Longest Nights.
            Some memories stay with you like shattered glass, making you bleed every time you stumble upon them. — Shattered Glass · The Longest Nights.
            I wear a sleep mask to bed. Every time I lift it up, I pray that it is already morning. — The Longest Nights · The Longest Nights.
            We already lost each other many weeks ago. I am getting back my peace. — Peace · The Longest Nights.
            I will always make time for emotions, and that’s how this book came to be. — For Emotions · Lust, Love, and Memories.
            Softness is my soft spot. We were creating art. — Soft Spot · Lust, Love, and Memories.
          </p>
        </div>
      </div>
    </section>

    <!-- ═══ 7. WRITE A NOTE + WALKING FIGURE (CORRESPONDENCE) ═══════════ -->
    <section class="sec write-section" id="write" aria-labelledby="wrH">
      <div class="container center-head">
        <span class="kicker text-sc">Correspondence</span>
        <h2 id="wrH" class="sec-title live">Write a note</h2>
        <p class="sec-desc text-serif-italic">
          Direct inquiries, reader reflections, and correspondence.
        </p>
      </div>

      <div class="container wr-grid">
        <div class="sheet-holder">
          <form
            class="sheet"
            [class.fold]="isFolded()"
            (submit)="onSendLetter($event)"
            novalidate
          >
            @if (!isSent()) {
              <label class="sheet-label">
                <span class="field-title">Your message</span>
                <textarea
                  name="message"
                  #letterMsg
                  class="letter-textarea"
                  placeholder="Write your note or reflection here..."
                  rows="6"
                ></textarea>
              </label>

              <label class="sheet-label">
                <span class="field-title">Your email</span>
                <input #letterEmail type="email" autocomplete="email" class="sheet-input" placeholder="email@address.com" />
              </label>

              <div class="send-row">
                <p class="form-error" role="alert">{{ formError() }}</p>
                <button type="submit" class="btn">Send Note</button>
              </div>
            } @else {
              <div class="thanks-msg-card">
                <h3 class="thanks-title text-serif-italic">Thank you for sending your message.</h3>
                <p class="thanks-body text-body">
                  I will get back to you as soon as I can. You can also connect directly on Instagram at
                  <a href="https://www.instagram.com/lustloveandmemories" target="_blank" rel="noopener" class="underline-link">&#64;lustloveandmemories</a>.
                </p>
                <div class="thanks-action">
                  <button type="button" class="btn btn-subtle" (click)="resetForm()">Write another note</button>
                </div>
              </div>
            }
          </form>
        </div>

        <!-- Walking Figure with smartphone alongside note (Writing figure preserved in background/code) -->
        <div class="wr-figure-wrap" #walkSection>
          <!-- Active walking figure canvas -->
          <canvas #walkCanvas class="walk-canvas" aria-hidden="true"></canvas>
          <!-- Preserved writer canvas (hidden) -->
          <canvas #writeCanvas class="writer-canvas" style="display:none;" aria-hidden="true"></canvas>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
      color: var(--ink);
      background: var(--paper);
    }

    .container {
      max-width: var(--max-w);
      margin: 0 auto;
      padding: 0 clamp(1.5rem, 4vw, 3rem);
    }

    .center-head {
      text-align: center;
      max-width: 680px;
      margin: 0 auto clamp(2.5rem, 5vw, 4rem);
    }

    .kicker {
      display: block;
      font-family: var(--font-sc);
      font-size: 0.82rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 0.85rem;
    }

    .sec-title {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(2.2rem, 1.8rem + 1.8vw, 3.4rem);
      line-height: 1.1;
      letter-spacing: -0.015em;
      color: var(--ink);
      margin: 0 0 0.85rem;
    }

    .sec-desc {
      font-size: clamp(1rem, 0.95rem + 0.25vw, 1.18rem);
      color: var(--ink-muted);
      line-height: 1.55;
      margin: 0;
    }

    .sec {
      padding: clamp(5rem, 10vh, 8.5rem) 0;
      position: relative;
    }

    /* ─── 1. HERO ─────────────────────────────────────────────────── */
    .global-sea-canvas {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
      display: block;
    }

    .hero {
      position: relative;
      min-height: 88vh;
      display: flex;
      align-items: center;
      padding: clamp(7.5rem, 15vh, 11rem) 0 clamp(5rem, 9vh, 7rem);
      overflow: hidden;
      background: transparent;
      z-index: 1;
    }

    .hero-spotlight {
      position: absolute;
      inset: 0;
      background: radial-gradient(
        ellipse 75% 65% at 30% 50%,
        rgba(248, 247, 243, 0.88) 0%,
        rgba(248, 247, 243, 0.45) 50%,
        rgba(248, 247, 243, 0) 100%
      );
      pointer-events: none;
      z-index: 2;
    }

    .hero-container {
      position: relative;
      z-index: 3;
      width: 100%;
      pointer-events: none;
    }

    .hero-lead {
      max-width: 740px;
      pointer-events: auto;
    }

    .hero-headline {
      font-family: var(--font-display);
      font-size: clamp(2.8rem, 1.8rem + 3.8vw, 5rem);
      font-weight: 400;
      font-style: italic;
      line-height: 1.08;
      letter-spacing: -0.02em;
      color: var(--ink);
      margin: 0 0 1.3rem;
    }

    .hero-sub {
      font-size: clamp(1.15rem, 1.05rem + 0.35vw, 1.4rem);
      color: var(--ink-soft);
      line-height: 1.5;
      margin: 0 0 2.2rem;
    }

    .hero-actions {
      display: flex;
      gap: 1.25rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: var(--ink);
      border: 1px solid var(--ink);
      padding: 0.55rem 1.45rem;
      font-family: var(--font-body);
      font-size: 0.88rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      text-transform: none;
      text-decoration: none;
      border-radius: 0;
      cursor: pointer;
      box-shadow: none;
      transition: background var(--dur-fast), color var(--dur-fast), border-color var(--dur-fast);
    }
    .btn:hover {
      background: var(--ink);
      color: var(--paper);
      transform: none;
      box-shadow: none;
    }

    .btn-ghost {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: var(--ink);
      border: 1px solid var(--rule);
      padding: 0.55rem 1.45rem;
      font-family: var(--font-body);
      font-size: 0.88rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      text-transform: none;
      text-decoration: none;
      border-radius: 0;
      transition: border-color var(--dur-fast), background var(--dur-fast);
    }
    .btn-ghost:hover {
      border-color: var(--ink);
      background: rgba(20, 19, 18, 0.04);
    }

    /* ─── 4. THE AUTHOR ───────────────────────────────────────────── */
    .author-section {
      background: transparent;
      position: relative;
      z-index: 1;
    }

    .author-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
      gap: clamp(3rem, 6vw, 6.5rem);
      align-items: center;
    }

    .author-photo-wrap {
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
    }

    .author-photo {
      width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 20px 48px -16px rgba(20, 19, 18, 0.20), 0 4px 12px rgba(20, 19, 18, 0.06);
      display: block;
    }

    .author-statement {
      margin: 1.8rem 0 0;
    }

    .statement-lead {
      font-family: var(--font-display);
      font-size: clamp(1.25rem, 1.15rem + 0.4vw, 1.6rem);
      line-height: 1.45;
      color: var(--ink);
      border-left: 2px solid var(--gold);
      padding-left: 1.25rem;
      margin: 0 0 1.25rem !important;
    }

    .author-summary {
      font-size: 1.05rem;
      line-height: 1.75;
      color: var(--ink);
      margin: 0 0 1.25rem;
    }

    .author-details {
      font-size: 0.95rem;
      line-height: 1.7;
      color: var(--ink-2);
      margin: 0 0 1.5rem;
    }

    .author-meta {
      margin-top: 1.4rem;
    }

    /* ─── 3. SHAPES IN TEXT (TRANSPARENT SILHOUETTES) ─────────────── */
    .shapes-section {
      background: transparent;
      position: relative;
      z-index: 1;
    }

    .shapes-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
      gap: clamp(2.5rem, 6vw, 6rem);
      align-items: center;
    }

    .shapes-main {
      font-size: clamp(1.2rem, 1.1rem + 0.4vw, 1.55rem);
      line-height: 1.45;
      color: var(--ink);
      margin: 1.5rem 0 1rem;
    }

    .shapes-sub {
      font-size: 1.05rem;
      line-height: 1.65;
      color: var(--gold);
      margin: 0;
      min-height: 2.8em;
    }

    .shapes-canvas-col {
      display: flex;
      justify-content: center;
    }

    .shapes-frame {
      position: relative;
      width: min(480px, 88vw);
      aspect-ratio: 100 / 110;
      background: transparent;
      box-shadow: none;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .fig-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }

    .fig-btn {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      border: none;
      cursor: pointer;
      border-radius: 8px;
    }
    .fig-btn:focus-visible {
      outline: 2px solid var(--gold);
      outline-offset: 4px;
    }

    /* ─── 4. BOOKS SHOWCASE (OPEN, FLUID EDITORIAL PRESENTATION) ───── */
    .works-section {
      background: transparent;
      position: relative;
      z-index: 1;
    }

    .books-sequential {
      display: flex;
      flex-direction: column;
      gap: clamp(7.5rem, 16vh, 12rem);
    }

    .book-feature {
      display: grid;
      grid-template-columns: minmax(0, 380px) minmax(0, 1fr);
      gap: clamp(2.5rem, 6vw, 5.5rem);
      align-items: center;
    }

    .book-feature--alt {
      grid-template-columns: minmax(0, 1fr) minmax(0, 380px);
    }

    .book-feature--alt .book-feature__cover {
      order: 2;
    }

    .book-feature--alt .book-feature__content {
      order: 1;
    }

    .book-feature__cover {
      width: 100%;
      max-width: 380px;
      margin: 0 auto;
    }

    .book-cover-anchor {
      display: block;
      width: 100%;
    }

    .book-img {
      width: 100%;
      height: auto;
      border-radius: 6px;
      box-shadow: 0 18px 42px -12px rgba(20, 19, 18, 0.20), 0 4px 12px rgba(20, 19, 18, 0.06);
      transition: transform var(--dur-med) var(--ease-out), box-shadow var(--dur-med) var(--ease-out);
      display: block;
    }
    .book-img:hover {
      transform: translateY(-4px);
      box-shadow: 0 24px 50px -12px rgba(20, 19, 18, 0.26);
    }

    .book-feature__content {
      display: flex;
      flex-direction: column;
    }

    .book-vol-tag {
      font-size: 0.8rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 0.6rem;
    }

    .book-title {
      font-family: var(--font-display);
      font-size: clamp(2rem, 1.6rem + 1.2vw, 2.7rem);
      font-weight: 400;
      color: var(--ink);
      line-height: 1.15;
      margin: 0 0 1rem;
    }

    .book-desc {
      font-size: 1.1rem;
      color: var(--ink-2);
      line-height: 1.75;
      margin: 0 0 1.8rem;
      max-width: 52ch;
    }

    .book-links {
      display: flex;
      gap: 1.5rem;
      align-items: center;
      margin-top: 1.4rem;
      flex-wrap: wrap;
    }

    .text-link {
      font-size: 0.92rem;
      font-weight: 500;
      color: var(--ink);
      text-decoration: none;
      border-bottom: 1px solid var(--ink);
      padding-bottom: 2px;
      transition: color var(--dur-fast), border-color var(--dur-fast);
    }
    .text-link:hover {
      color: var(--gold);
      border-color: var(--gold);
    }

    /* ─── 5. REVEALING WORDS SECTION ──────────────────────────────── */
    .reveal-section {
      background: transparent;
      position: relative;
      z-index: 1;
    }

    .reveal-section .kicker {
      margin-bottom: 0.5rem;
    }

    .reveal-section .sec-title {
      margin-bottom: 0.5rem;
    }

    .reveal-section .center-head {
      margin-bottom: clamp(1.3rem, 2.6vw, 2rem);
    }

    .reveal-wrap {
      position: relative;
      width: 100%;
      max-width: 960px;
      min-height: 350px;
      margin: 0 auto;
      padding: 0.5rem 1rem 1.35rem;
      background: radial-gradient(
        ellipse 65% 55% at 50% 50%,
        rgba(243, 240, 233, 0.85) 0%,
        rgba(248, 247, 243, 0) 100%
      );
      border-radius: 12px;
    }

    .reveal-canvas {
      width: 100%;
      height: clamp(320px, 38vw, 400px);
      cursor: url('/images/quill-cursor.png') 0 52, crosshair;
      cursor: -webkit-image-set(url('/images/quill-cursor.png') 1x, url('/images/quill-cursor@2x.png') 2x) 0 52, url('/images/quill-cursor.png') 0 52, crosshair;
      display: block;
    }

    /* ─── 6. WRITE A NOTE ─────────────────────────────────────────── */
    .write-section {
      background: transparent;
      position: relative;
      z-index: 1;
    }

    .write-section .kicker {
      color: var(--ink-3);
    }

    .write-section .sec-desc {
      color: var(--ink-3);
    }

    .wr-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      gap: clamp(2.5rem, 5vw, 5rem);
      align-items: stretch;
    }

    .sheet-holder {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      position: relative;
    }

    .sheet {
      background: var(--paper-sheet);
      padding: clamp(2rem, 4vw, 3rem);
      border-radius: 8px;
      box-shadow: 0 20px 50px -20px rgba(28, 22, 16, 0.10);
      position: relative;
      min-height: 440px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
    }

    .sheet-label {
      display: block;
      margin-bottom: 1.5rem;
    }

    .field-title {
      display: block;
      font-size: 0.82rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink-3);
      margin-bottom: 0.5rem;
    }

    .letter-textarea {
      width: 100%;
      border: 1px solid var(--rule-soft);
      background: var(--paper);
      padding: 1rem 1.1rem;
      font-family: var(--font-body);
      font-size: 1rem;
      line-height: 1.6;
      color: var(--ink);
      border-radius: 4px;
      resize: vertical;
      box-sizing: border-box;
      transition: border-color var(--dur-fast);
    }
    .letter-textarea:focus {
      outline: none;
      border-color: var(--gold);
    }

    .fields {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1.25rem;
    }

    .sheet-input {
      width: 100%;
      border: 1px solid var(--rule-soft);
      background: var(--paper);
      padding: 0.75rem 1rem;
      font-family: var(--font-body);
      font-size: 0.95rem;
      color: var(--ink);
      border-radius: 4px;
      box-sizing: border-box;
      transition: border-color var(--dur-fast);
    }
    .sheet-input:focus {
      outline: none;
      border-color: var(--gold);
    }

    .send-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
    }

    .form-error {
      color: var(--rose);
      font-size: 0.88rem;
      margin: 0;
    }

    .thanks-msg-card {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      padding: 1.5rem 0;
    }

    .thanks-title {
      font-size: 1.6rem;
      font-weight: 400;
      color: var(--ink);
      margin: 0 0 1rem;
    }

    .thanks-body {
      font-size: 1.05rem;
      line-height: 1.7;
      color: var(--ink-2);
      margin: 0 0 2rem;
    }

    .thanks-action {
      margin-top: auto;
    }

    .wr-figure-wrap {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      padding-bottom: 0;
      min-height: 440px;
      position: relative;
      background: radial-gradient(
        ellipse 80% 75% at 50% 60%,
        var(--paper) 0%,
        var(--paper) 48%,
        rgba(248, 247, 243, 0.75) 72%,
        rgba(248, 247, 243, 0) 100%
      );
      border-radius: 28px;
    }

    .walk-canvas {
      width: clamp(220px, 25vw, 300px);
      height: auto;
      aspect-ratio: 100 / 155;
      display: block;
      margin: 0 auto;
      cursor: crosshair;
      background: transparent;
      transform: translateX(var(--walk, 0px));
      transition: transform 0.1s ease-out;
    }

    .writer-canvas {
      width: clamp(280px, 32vw, 420px);
      height: auto;
      aspect-ratio: 154 / 152;
      display: block;
      margin: 0 auto;
      cursor: crosshair;
      background: transparent;
    }

    /* ─── RESPONSIVE BREAKPOINTS ──────────────────────────────────── */
    @media (max-width: 900px) {
      .author-grid,
      .shapes-grid,
      .wr-grid {
        grid-template-columns: 1fr;
        gap: 3rem;
      }

      .book-feature,
      .book-feature--alt {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }

      .book-feature--alt .book-feature__cover {
        order: 0;
      }

      .book-feature--alt .book-feature__content {
        order: 1;
      }

      .shapes-canvas-col {
        order: -1;
      }

      .fields {
        grid-template-columns: 1fr;
      }
    }
  `
})
export default class HomeComponent {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  seaCanvas = viewChild<ElementRef<HTMLCanvasElement>>('seaCanvas');
  shapesSection = viewChild<ElementRef<HTMLElement>>('shapesSection');
  figCanvas = viewChild<ElementRef<HTMLCanvasElement>>('figCanvas');
  figBtn = viewChild<ElementRef<HTMLElement>>('figBtn');
  figCaption = viewChild<ElementRef<HTMLElement>>('figCaption');

  revealCanvas = viewChild<ElementRef<HTMLCanvasElement>>('revealCanvas');
  walkCanvas = viewChild<ElementRef<HTMLCanvasElement>>('walkCanvas');
  walkSection = viewChild<ElementRef<HTMLElement>>('walkSection');
  writeCanvas = viewChild<ElementRef<HTMLCanvasElement>>('writeCanvas');
  writeSection = viewChild<ElementRef<HTMLElement>>('writeSection');

  private walkerHandle: WalkingFigureHandle | null = null;

  letterMsg = viewChild<ElementRef<HTMLTextAreaElement>>('letterMsg');
  letterEmail = viewChild<ElementRef<HTMLInputElement>>('letterEmail');

  isFolded = signal(false);
  isSent = signal(false);
  formError = signal('');
  currentYear = new Date().getFullYear();

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const prefersRM =
        this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;

      // 1. Initialize live letter tilt on all headings
      setupLiveLetters(this.document.body, prefersRM);

      // 2. Initialize Hero Ocean Wave of Letters
      const cvSea = this.seaCanvas()?.nativeElement;
      if (cvSea) {
        initLetterSea(cvSea, prefersRM, '#5c564d');
      }

      // 3. Initialize Shapes in Text (Morphing Typographic Figures)
      const cvFig = this.figCanvas()?.nativeElement;
      const btnFig = this.figBtn()?.nativeElement;
      const capFig = this.figCaption()?.nativeElement;
      const secFig = this.shapesSection()?.nativeElement;
      if (cvFig && btnFig && capFig && secFig) {
        initHeroFigure(cvFig, btnFig, capFig, secFig, prefersRM, '#141312');
      }

      // 4. Initialize Revealing Poetry Canvas
      const cvRev = this.revealCanvas()?.nativeElement;
      if (cvRev) {
        initRevealingPoem(cvRev, CURATED_POEMS, prefersRM, '#141312', (url) => {
          this.router.navigateByUrl(url);
        });
      }

      // 5. Initialize Walking Figure with smartphone in Correspondence section (Writer figure preserved)
      const cvWalk = this.walkCanvas()?.nativeElement;
      const walkEl = this.walkSection()?.nativeElement;
      if (cvWalk && walkEl) {
        this.walkerHandle = initWalkingFigure(cvWalk, walkEl, prefersRM, '#141312');
        this.destroyRef.onDestroy(() => {
          this.walkerHandle?.destroy();
        });
      }
    });
  }

  onSendLetter(e: Event) {
    e.preventDefault();
    const msg = this.letterMsg()?.nativeElement.value.trim() ?? '';
    const email = this.letterEmail()?.nativeElement.value.trim() ?? '';

    if (!msg) {
      this.formError.set('Please write your note before sending.');
      this.letterMsg()?.nativeElement.focus();
      return;
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      this.formError.set('Please check your email address format.');
      this.letterEmail()?.nativeElement.focus();
      return;
    }

    this.formError.set('');
    this.isFolded.set(true);

    // Easter egg: Woosh of poetic letters bursting from the smartphone and soaring offscreen right!
    this.walkerHandle?.sendNote();

    const subject = encodeURIComponent('Note from Reader');
    const body = encodeURIComponent(`${msg}\n\n— ${email ? 'Reader (' + email + ')' : 'A reader'}`);
    const mailtoUrl = `mailto:lustloveandmemories@gmail.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
      this.isSent.set(true);
      if (isPlatformBrowser(this.platformId) && this.document.defaultView) {
        this.document.defaultView.location.href = mailtoUrl;
      }
    }, 1200);
  }

  resetForm() {
    this.isSent.set(false);
    this.isFolded.set(false);
    this.formError.set('');
  }
}
