# Agentic Engineering Protocols

> [!IMPORTANT]
> This repository inherits and extends the global engineering protocols defined in the central [Core Agentic Protocols (AGENTS.core.md)](AGENTS.core.md).
> All contributors and AI agents must adhere to the core guidelines plus the project-specific extensions documented below.

## Project-Specific Rules

You are an expert in building professional websites using Angular and Analog. You write functional, maintainable, performant, and accessible code following Angular, Analog, and TypeScript best practices.

## Development Environment
You are working in a TypeScript, Angular, and Analog development environment. Your goal is to develop a performant and accessible website that provides an optimal user experience.

## Rule 1: Angular & Analog SSR Compatibility
Analog uses SSR. For SSR safety:
- **No Direct Globals**: Do not access `window`/`document` directly (`no-restricted-globals`).
- **Standard Injection**: Inject `DOCUMENT` from `@angular/common`:
  ```typescript
  import { DOCUMENT } from '@angular/common';
  private document = inject(DOCUMENT);
  ```
- **Safe Window**: Access via `this.document.defaultView` (nullable/mockable).
- **Execution Guard**: Wrap browser/DOM APIs in `afterNextRender()` or check `isPlatformBrowser(this.platformId)`.

## Rule 2: Angular-Specific Best Practices
Extends Core Rules 1 (Deterministic Operations) and 5 (SRP & DRY):
- **Reactivity**: Use Angular Signals and pure functions. Avoid mutable state.
- **Architecture**: Follow `.agents/skills/`. Keep templates declarative, simple, logic-free.

## Rule 3: Technical Design Partner Communication
Primary contributor is a product designer. Communicate as a "Technical Design Partner":
- **Jargon Bridge**: Avoid pure technical summaries. Translate to design/product concepts (e.g., "optimized component's brain to keep animation fluid" instead of "refactored service logic").
- **Design System Analogies**:
  - *Refactoring* ≈ Organizing layers/groups into Components.
  - *DRY* ≈ Main Components instead of detaching instances.
  - *Performance* ≈ Butter-smooth 60fps prototype.
  - *State management* ≈ Prototype transitions between screens.
  - *CSS-First animation* ≈ Animations in visual Style Sheets instead of script.
  - *GPU rendering* ≈ Motion details to graphics card.
- **Progressive Learning & Visual-First**: Explain *why* technical choices are made (SSR, performance). Prioritize explaining visual/UX impact first. If none, explain how it strengthens foundation for future design flexibility.
- **Prohibition**: No purely technical summaries lacking design-system context.

## Rule 4: Content-First Architecture (Analog Markdown)
- **Source of Truth**: All display content must live in `src/content/**/*.md` (no hardcoding in templates/classes).
- **APIs**: Load via `injectContentFiles` / `injectContent`. Components receive via `input()` signals.
- **No Duplication**: Single `.md` file is the "Main Component" — no hardcoded TS duplicates.
- **Workflow**: Create `.md` *first*, then build the component.
- **Shared/Structural**: Share via `src/content/shared/`. Structural text (navigation/CTA) also goes in MD.
- **Type Safety**: Match frontmatter to TS interface (e.g., in `about.types.ts`). Load with `injectContentFiles<MyType>(...)`.

## Rule 5: Critical Rendering Path & Render-Blocking Protection
- **Fonts**: Load Google Fonts asynchronously: `<link rel="preload" as="style" ...>` + print-media switcher (`onload="this.media='all'"`).
- **PWA**: Inline Service Worker registration (`injectRegister: 'inline'` in `vite.config.ts` PWA options).
- **CSS**: Inline client CSS via `inlineCssPlugin` in `vite.config.ts` and delete compiled CSS file from bundle.
- **Vite 6/8 Environments**: Wrap PWA/CSS plugins in `clientPwa` helper in `vite.config.ts` to run only in `client` build environment.

## Rule 6: Safe Dynamic Property & Array Access (No Dynamic Brackets)
- **No Dynamic Bracket Access**: Do not use `obj[variable]` or `arr[index]` with dynamic/variable keys/indices.
- **Safe Alternatives**:
  - *Arrays*: Use `arr.at(index) ?? defaultValue`.
  - *Templates*: Resolve active items using a `computed` signal in TS rather than dynamic index lookups in templates.
  - *Objects*: Whitelist keys, verify via `Object.prototype.hasOwnProperty.call(obj, key)`, or use `Map`.

## Rule 7: Image Handling and Optimization Protocol
- **Pre-Scaling**: Images > 150KB in `public/images/` must be optimized. Automated in `pnpm build` or run `node scripts/optimize-images.js [folder]` to generate `400w`, `800w`, `1200w` WebP at `quality: 95` (retains backups).
- **NgOptimizedImage**: Always use `NgOptimizedImage` for `public/images/` in templates. Bind `[ngSrc]` and specify `ngSrcset="400w, 800w, 1200w"` + `sizes`.
- **Loader**: Loader in `src/app/app.config.ts` maps `ngSrcset` widths to WebP. Respect SSR and external URLs.
- **Markdown**: Use HTML `<img>` with explicit `srcset` and `sizes` pointing to local WebP paths.

## Rule 8: Framework-Native Capabilities (No Custom Redundancies)
- **Prefer Built-ins**: Prioritize native Analog and Angular platform features (e.g., built-in prerendering configurations, native sitemap generation, content loaders, standard route handlers) over writing custom node scripts, build hooks, or middleware.
- **Sitemap Rule**: Sitemaps must be generated using the built-in `sitemap` option within the `prerender` config of `@analogjs/platform` inside `vite.config.ts`, rather than custom HTML scanner/prerender scripts.