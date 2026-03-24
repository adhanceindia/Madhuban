# Design System Strategy: The Ethereal Estate

## 1. Overview & Creative North Star: "The Digital Sanctuary"

This design system is built to evoke the quiet majesty of a high-end Indian retreat. Our Creative North Star is **"The Digital Sanctuary"**—a philosophy where the interface recedes to allow nature-forward photography and heritage typography to breathe.

We move beyond the "template" look by rejecting rigid, boxed-in grids. Instead, we utilize **intentional asymmetry** and **tonal layering**. Elements should feel as though they are resting on a surface of fine linen or handmade paper, rather than being trapped inside a digital frame. By using generous whitespace (our "breath") and overlapping components, we create a sense of effortless luxury and peaceful flow.

---

## 2. Color & Surface Philosophy

The palette is a dialogue between the lush greenery of the Indian landscape and the sun-bleached creams of traditional architecture.

### The "No-Line" Rule

**Explicit Instruction:** 1px solid borders are prohibited for sectioning. Boundaries must be defined solely through background color shifts.

- Use `surface-container-low` (#f5f3ee) for large section backgrounds to distinguish them from the main `surface` (#fbf9f4).
- Avoid the "grid-box" look; let the content define its own boundary through its relationship with white space.

### Surface Hierarchy & Nesting

Treat the UI as a series of physical layers. We use the Material surface tiers to create depth without shadows:

1.  **Base Layer:** `surface` (#fbf9f4) — The primary canvas.
2.  **Sectioning Layer:** `surface-container-low` (#f5f3ee) — To define a secondary area (e.g., a "Services" section).
3.  **Component Layer:** `surface-container-highest` (#e4e2dd) — For elevated cards or nested information.

### Glass & Gradient Rule

To ensure a bespoke feel, use **Glassmorphism** for floating navigation bars or booking modals. Apply a `surface` color at 70% opacity with a `backdrop-blur: 20px`.

- **Signature Textures:** For primary CTAs, use a subtle linear gradient from `primary` (#386a0e) to `primary-container` (#a9e47b). This prevents the "flat-UI" fatigue and adds a organic, light-catching quality.

---

## 3. Typography: Editorial Heritage

Our typography pairs the rhythmic, poetic nature of _Cormorant Garamond_ with the functional clarity of _DM Sans_.

- **Display & Headlines (Cormorant Garamond - Italic):** These should be used sparingly but boldly. The italic style is our "signature"—it feels handwritten and personal. Use `display-lg` (3.5rem) for hero statements to evoke an editorial magazine feel.
- **Body & Titles (DM Sans):** Used for all functional data. It provides a grounded, modern counterpoint to the romanticism of the headings.
- **The Hierarchy of Peace:** Maintain high contrast between heading sizes and body text. Large headlines should be paired with generous tracking and `on-surface-variant` (#44483d) for a softer, more luxurious read than pure black.

---

## 4. Elevation & Depth: Tonal Layering

We do not use "shadows" in the traditional sense. We use light.

- **The Layering Principle:** Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f5f3ee) background. The 12px radius (`md`) combined with this tonal shift creates a "natural lift" that feels architectural.
- **Ambient Shadows:** If a floating element (like a "Book Now" floating button) requires a shadow, it must be `on-surface` (#1b1c19) at 4% opacity, with a 40px blur and 10px Y-offset. It should look like a soft glow, not a drop shadow.
- **The Ghost Border:** If a border is required for accessibility (e.g., input fields), use the `outline-variant` (#c5c8b9) at **20% opacity**. It should be a mere suggestion of a container.

---

## 5. Components & Interaction

### Buttons

- **Primary:** A subtle gradient from `primary` to `primary-container`. Typography is `label-md` in white, all-caps with 0.1rem letter spacing.
- **Secondary:** No background. An `outline-variant` ghost border (20% opacity) with `on-surface` text.
- **Tertiary:** Pure text links in `tertiary` (#885200 / Gold accent).

### Cards & Lists

- **The Divider Ban:** Never use horizontal lines to separate list items. Use the **Spacing Scale** `6` (2rem) or `8` (2.75rem) to separate content.
- **High-End Imagery:** Cards should be "Image-First." Apply the 12px border radius (`md`) to the image, and let the text sit below it on the naked `surface`, creating an asymmetrical, gallery-like feel.

### Input Fields

- Background should be `surface-container-lowest` (#ffffff).
- Focus state: The border shifts from a 20% ghost border to a soft `primary` (#386a0e) glow.
- Labels: Always use `label-sm` in `on-surface-variant`.

### Signature Component: The "Heritage Overlay"

A custom component for this design system: A full-bleed image with a `surface-container-low` text box overlapping it by 15%. This intentional "collision" of elements breaks the grid and feels like a luxury travel brochure.

---

## 6. Do’s and Don’ts

### Do:

- **Do** use asymmetrical layouts where text is left-aligned and images are right-aligned with varying margins.
- **Do** leverage the `tertiary` Gold (#BA7517) for very small, high-impact details like "5 Stars" or "Member Exclusive" labels.
- **Do** use large image-to-text ratios (60% image, 40% text).

### Don’t:

- **Don’t** use dark themes. This brand lives in the light.
- **Don’t** use high-contrast, 100% opaque borders. They "trap" the nature-forward energy.
- **Don’t** use standard "system" icons. Only use thin-line, minimal custom icons that match the `outline` token.
- **Don’t** crowd the edges. If you think there is enough margin, add 20% more.
