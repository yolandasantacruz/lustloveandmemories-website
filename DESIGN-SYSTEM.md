# Design System Specification

> [!IMPORTANT]
> This document extends [Core Design Specification (DESIGN-SYSTEM.core.md)](DESIGN-SYSTEM.core.md).
> All contributors and AI agents must adhere to the core design rules plus the project-specific rules defined below.

## 1. Typography
The typographic scale emphasizes a "Dark Romantic Literary" feel. Do not redefine fonts in local CSS components.
- **Display & Headings**: `EB Garamond` (preferred, often italicized, `font-weight: 400`). Fallback chain: `Iowan Old Style`, `Palatino Linotype`, `Palatino`, `Georgia`, `serif`. Used for hero titles, section titles, quotes, and primary elegance.
- **Structural Headings**: `Cormorant SC` (Small Caps, tracking expanded). Fallback chain: `EB Garamond`, `Iowan Old Style`, `Palatino Linotype`, `Palatino`, `Georgia`, `serif`. Used for section titles and structured categorization.
- **Body & UI**: `DM Sans` (`font-weight: 300` or `500`). Used for all readable body text, buttons, and small UI labels to maintain modern legibility against the ornate display fonts.

## 2. Colors
The color palette represents warm, dark, analog romance. Avoid generic colors (like `#000` or `#fff`) and use these curated tokens:
- **Ink (`--ink`, `--ink-soft`, `--ink-muted`)**: Carbon and deep archival charcoal tones (`#141312`, `#57534c`, `#78716c`) used for primary titles, readable body copy, and secondary editorial metadata.
- **Paper & Parchment (`--paper`, `--paper-2`, `--paper-sheet`)**: Warm, luxurious linen paper backgrounds (`#f8f7f3`, `#f1eee8`, `#fcfbf8`) providing a bright, tactile canvas reminiscent of classic publishing and letterpress sheets.
- **Gold & Stone (`--gold`, `--gold-light`, `--gold-dim`)**: Muted mineral stone and gold tones (`#78716c`, `#a8a29e`) used for subtle kickers, labels, dividers, and accents.
- **Rose (`--rose`)**: Deep burgundy/rose (`#8c3a3a`) used sparingly for evocative poetic accents.
- **Surfaces & Glass**: Semi-transparent overlays (`--surface-glass`) that leverage subtle backdrop blurring to preserve atmospheric layers without heavy solid containers.

## 3. Elevation & Tactile Surfaces (Drop Shadows)
To preserve the tactile elegance of physical print, letterpress stationery, and archival photography, all elevated surface components share a single, unified lighting and drop-shadow model:

- **Main Component Elevation Token**: `--shadow-sheet: 0 20px 50px -20px rgba(28, 22, 16, 0.10);`
  - *Light Source & Physics*: Emulates a soft, subtle overhead light falling across archival paper. The negative spread (`-20px`) reins in the blur radius to prevent muddy haloing, delivering a clean, subtle, centered lift from the background.
- **Unified Elements (Zero Detached Instances)**:
  - **Correspondence & Message Modules**: The letterform card (`.sheet`) in the "Write a Note" / Correspondence section.
  - **Author Portraits**: The author photograph (`.author-photo` in "Behind the Letters" and `.bio-portrait__frame` in About).
  - **Book Covers**: Volume covers (`.book-img` in Book Features, `.book-cover` in Book Details, and `.book-row__cover`).
  - **Editorial Paper Cards**: Long-form paper reading sheets (`.privacy-article`).
- **Design Guardrail**: Never introduce arbitrary or detached ad-hoc drop shadows (e.g. `0 16px 40px...`, `0 24px 80px...`). Any physical sheet, photograph, or book cover must strictly consume `var(--shadow-sheet)` to maintain consistent depth and atmospheric cohesion.

## 4. Elements
### Buttons
To maintain design integrity and a premium "literary" aesthetic across the website, all buttons should share a single, unified look.
- **Source of Truth**: All standard buttons must use only the `.btn` CSS class. Avoid creating custom variants (`.btn--gold`, `.btn--dark`, etc.) to prevent CSS bloat.
- **Look and Feel**: The default button state is a clean, transparent background with a crisp ink border (`var(--ink)`). Typography uses modern proportions with balanced letter-spacing.
- **Interaction**: On hover, the button softly transitions with an inverted solid fill (`background: var(--ink); color: var(--paper);`), maintaining crisp editorial elegance without heavy skeuomorphic glares.