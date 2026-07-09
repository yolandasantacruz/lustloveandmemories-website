# Design System Specification

> [!IMPORTANT]
> This document extends [Core Design Specification (DESIGN-SYSTEM.core.md)](DESIGN-SYSTEM.core.md).
> All contributors and AI agents must adhere to the core design rules plus the project-specific rules defined below.

## 1. Typography
The typographic scale emphasizes a "Dark Romantic Literary" feel. Do not redefine fonts in local CSS components.
- **Display & Headings**: `Cormorant Garamond` (often italicized, `font-weight: 300` or `400`). Used for hero titles, quotes, and primary elegance.
- **Structural Headings**: `Cormorant SC` (Small Caps, tracking expanded). Used for section titles and structured categorization.
- **Body & UI**: `DM Sans` (`font-weight: 300` or `500`). Used for all readable body text, buttons, and small UI labels to maintain modern legibility against the ornate display fonts.

## 2. Colors
The color palette represents warm, dark, analog romance. Avoid generic colors (like `#000` or `#fff`) and use these curated tokens:
- **Ink (`--ink`, `--ink-soft`)**: Warm, near-black hues used as the primary background for all pages and sections, creating a void-like canvas.
- **Parchment (`--parchment`, `--parchment-2`)**: Warm, aged off-white used for primary text. It is easier on the eyes than pure white, specifically for dark mode.
- **Gold (`--gold`, `--gold-light`)**: Antique warm gold used for accents, dividers, ornaments (`✦`), and interactive elements like buttons.
- **Rose (`--rose`)**: Deep burgundy/rose used sparingly for evocative accents.
- **Surfaces & Glass**: Semi-transparent overlays (`--surface-card`, `--surface-glass`) that leverage the dark background to create depth without solid boxes.
## 3. Elements
### Buttons
To maintain design integrity and a premium "literary" aesthetic across the website, all buttons should share a single, unified look.
- **Source of Truth**: All standard buttons must use only the `.btn` CSS class. Avoid creating custom variants (`.btn--gold`, `.btn--dark`, etc.) to prevent CSS bloat.
- **Look and Feel**: The default button state is a clean, transparent background with a golden outline (`var(--gold)`). Typography should be uppercase, tracking slightly widened, and sized for elegance.
- **Interaction**: On hover, the button background softly fills with a dim gold (`var(--gold-dim)`), and it emits a gentle, diffused golden glow (`box-shadow`), while translating up slightly `(-2px)`. This creates a tactile, luxurious interaction.