---
name: Project Design Tokens & Color Palette
description: Comprehensive catalog of design tokens, color palette, font config, and border-radius tokens defined in tailwind.config.ts and globals.css for Madhuban Garden Resort
type: project
---

## Color Palette (tailwind.config.ts)
- Primary green: #386a0e (with shades 50-900, plus `primary-light: #eef4e7`, `primary-deep: #356609`)
- Gold accent: #ba7517 (with shades 50-900, plus `gold-dark: #a46612`, `gold-light: #fef3c7`)
- Background: #f8f9f4
- Foreground: #111827
- Border/Input: #e5e7eb
- Legacy alias: `primary-dark: #2f590b`

## Font Tokens
- `--font-display`: Cormorant Garamond (serif)
- `--font-body`: DM Sans (sans-serif)
- `--font-admin`: Plus Jakarta Sans (admin only, custom.scss)
- `--font-admin-mono`: Geist Mono (admin only)

## Custom CSS Variables
- globals.css defines all shadcn-style tokens in :root
- custom.scss re-declares many same values under `--madhuban-*` namespace for admin
- Both files define `--background`, `--primary`, `--border` etc. with identical values

## Key Observations
- Color values are triple-defined: tailwind.config.ts hardcoded + globals.css CSS vars + custom.scss admin vars
- No dark mode support on frontend (only admin has dark mode overrides)
- Border radius uses `var(--radius)` = 1rem, but components heavily use arbitrary `rounded-[Xrem]` values

**Why:** This forms the baseline for identifying hardcoded values, duplicates, and inconsistencies across the codebase.

**How to apply:** Reference this when evaluating whether a hex value should use a token, and when checking for duplicate variable declarations.
