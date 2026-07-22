# Yuvraj's Standard Documentation Design System

## Overview
This document defines the standard design system for Yuvraj's upcoming React-based documentation websites. The aesthetic is a **highly-polished, pure monochrome dark mode** inspired by the layout and UX of the Shopify Developer Docs. 

This document serves as the exact blueprint for any AI agent or developer to recreate this documentation system using **React (Next.js)** and **Tailwind CSS**.

---

## 1. Design Tokens (Monochrome Palette)

The color system strictly avoids saturated colors (no blues, greens, or teals) in favor of a sleek grayscale spectrum.

### 1.1 Backgrounds
| Token | Hex Value | Usage |
|-------|-----------|-------|
| `--color-bg-base` | `#000000` | Main application background (body, header, sidebar) |
| `--color-bg-subnav` | `#0a0a0a` | Secondary navigation header background |
| `--color-bg-surface` | `#121212` | Default background for surface cards and interactive elements |
| `--color-bg-surface-hover` | `#1e1e1e` | Hover state for surface cards |
| `--color-code-bg` | `#0a0a0a` | Background for code blocks |

### 1.2 Text & Typography Colors
| Token | Hex Value | Usage |
|-------|-----------|-------|
| `--color-text-primary` | `#f5f5f5` | Main headings and high-emphasis text |
| `--color-text-secondary` | `#a3a3a3` | Body copy, descriptions, and sidebar links |
| `--color-text-tertiary` | `#737373` | Muted text, metadata, subtle borders |
| `--color-text-accent` | `#ffffff` | Primary links and active state text |

### 1.3 Borders
| Token | Hex Value | Usage |
|-------|-----------|-------|
| `--color-border` | `#333333` | Standard dividers (sidebar, header, cards) |
| `--color-border-subtle`| `#262626` | Faint dividers within components |
| `--color-border-hover` | `#404040` | Hover state for borders on interactive cards |

### 1.4 Interactive / Accents
| Token | Hex Value | Usage |
|-------|-----------|-------|
| `--color-primary` | `#ffffff` | Primary actions (buttons, active indicators) |
| `--color-primary-text` | `#000000` | Text color *inside* primary buttons |

---

## 2. Typography

The design relies on maximum legibility and clean geometric sans-serifs.

- **Body Font:** `Inter`, `-apple-system`, `sans-serif`
  - Weights: `400` (Regular), `500` (Medium), `600` (Semi-bold), `700` (Bold)
- **Code Font:** `JetBrains Mono`, `monospace`
  - Weights: `400`, `500`

### Sizing Scale
- `xs` (12px) - Eyebrows, TOC headers, metadata
- `sm` (14px) - Sidebar links, top-nav, card titles
- `base` (15px) - Main body copy (`line-height: 1.5`)
- `lg` (18px) - Lead text paragraphs
- `xl` (20px) - Section headers (h2)
- `3xl` (32px) - Page titles (h1)

---

## 3. Layout Architecture

The application uses a responsive, 3-column layout on desktop, condensing gracefully on smaller screens.

### 3.1 Dimensions
- **Main Header Height:** `56px` (Sticky, `z-index: 100`)
- **Sub-navigation Height:** `48px` (Sticky, `z-index: 99`, sits right below the main header)
- **Left Sidebar Width:** `260px`
- **Right TOC Width:** `240px`
- **Max Content Width:** `1440px` for the entire app container.

### 3.2 Main Layout Grid
```tsx
<div className="flex max-w-[1440px] mx-auto min-h-screen">
  <Sidebar className="w-[260px] sticky top-[104px] border-r border-[#333333]" />
  <MainContent className="flex-1 px-12 py-10" />
  <TableOfContents className="w-[240px] sticky top-[104px]" />
</div>
```

---

## 4. UI Components

### 4.1 Navigation Header (Two-Tier)
- **Tier 1 (Top):** Contains the logo (`font-weight: 600`), main sections (Apps, Storefronts), and right-aligned utilities (Search, Dark Mode, Log In).
- **Tier 2 (Subnav):** A highly distinct secondary bar tracking the specific sub-section (e.g., `APPS | Build Design Launch`). Uses the `#0a0a0a` background.
- **Button ("Ask Assistant"):** A pill-shaped button. Background: `#1a1a1a`, Border: `#333333`, Text: `#e5e5e5`. Hover state changes background to `#262626`.

### 4.2 Left Sidebar
- **Section Headers:** Uppercase, `11px`, `tracking-wider`, `#a3a3a3`.
- **Links:** `#a3a3a3` text, `14px`.
- **Active State:** Extremely specific.
  - Background: `#121212`
  - Text: `#ffffff`
  - Border Left: `2px solid #ffffff`
  - Font Weight: `500`

### 4.3 Surface Cards (Grid)
Used extensively for navigation grids on overview pages.
- **Background:** `#121212`
- **Border:** `1px solid #333333`
- **Border Radius:** `8px`
- **Padding:** `20px`
- **Hover State:** Background shifts to `#1e1e1e`, border shifts to `#404040`.
- **Icon:** Represented via 24px pixel art, SVG, or crisp monochrome emojis.

### 4.4 Right Table of Contents (TOC)
- **Header:** "ON THIS PAGE" (12px, uppercase, tracking-wider).
- **Links:** 13px, `#a3a3a3`.
- **Border:** The entire TOC list has a left border of `#333333`.
- **Active State:** Text becomes `#ffffff`, and the individual link gets a `border-left: 2px solid #ffffff` that aligns perfectly over the parent border.

---

## 5. React / Tailwind Implementation Guidelines

When an agent builds this out in Next.js + Tailwind, follow these rules:

1. **Extend `tailwind.config.ts`:**
   Do not hardcode hex values in class names (e.g., `bg-[#121212]`). Map the design tokens exactly to the tailwind config:
   ```javascript
   theme: {
     colors: {
       background: {
         DEFAULT: '#000000',
         surface: '#121212',
         subnav: '#0a0a0a',
       },
       border: {
         DEFAULT: '#333333',
         hover: '#404040',
       },
       // ... map typography and accents accordingly
     }
   }
   ```

2. **Component Separation:**
   - `Header.tsx`: Handles both tiers of the top navigation.
   - `Sidebar.tsx`: Generates the left nav iteratively from a JSON config.
   - `Toc.tsx`: Uses IntersectionObserver to track heading scroll position and update the active state.
   - `SurfaceCard.tsx`: Reusable grid card component.

3. **Content Rendering (MDX):**
   - Override standard markdown elements (h1, h2, p, code) to match the typography scale listed in Section 2.
   - Ensure `<p>` tags use `#a3a3a3` and have a `margin-bottom` of `1rem`. 
   - `h1` must be `#ffffff` and `32px` (`text-3xl`).

*This document is the absolute source of truth for Yuvraj's standard documentation projects.*
