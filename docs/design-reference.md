# Design Reference: Customer Dashboard

## 1. Core Principles
- **Vibe:** Premium, Calm, Elegant, Spacious, Nature-inspired, Modern.
- **Aesthetic:** Closer to a luxury hospitality brand than a SaaS or enterprise application.
- **UX Goal:** Simplicity, discoverability, minimal clicks, fast task completion, and consistent interactions.

## 2. Color Palette
Reuse the existing color palette from the public website:
- **Primary:** `#4CAF50` (Used for primary buttons, success states, nav highlights, links, status badges)
- **Background:** `#f5f9f0` (Used for page backgrounds to maintain a light, fresh feel)
- **Accent:** `#2e7d32`
- **Text:** `#1a1a1a` (High legibility)
- **White:** `#ffffff` (Used for cards and elevated surfaces)
- **Neutral Colors:** Use subtle grays/off-whites for secondary backgrounds, borders, and dividers.

## 3. Typography
- **Headings:** Elegant serif (as used on the main site). Avoid generic fonts like Inter, Roboto, Arial.
- **Body:** Clean sans-serif.
- **Characteristics:** Large welcoming headings, clear section titles, comfortable reading sizes, strong hierarchy, and excellent legibility.

## 4. Components & Layout
- **Containers:** Rounded cards with soft shadows.
- **Spacing:** Spacious layouts, airy and uncluttered.
- **Imagery:** High-quality room imagery prominently featured.
- **Icons:** Clean iconography (Lucide React).
- **Controls:** Consistent button styles and form controls.
- **Navigation:** Minimal sidebar navigation (Dashboard, My Bookings, Notifications, Profile, Book a Stay, Logout).

## 5. Responsive Behavior
- **Mobile-First:** Fully responsive across Desktop, Tablet, and Mobile.
- **Adaptation:** Do not simply shrink desktop screens. Adapt layouts for touch interactions, stacking cards cleanly, and optimizing spacing for smaller viewports.

## 6. Interaction Patterns & Micro-Interactions
- **Transitions:** Smooth page transitions (using Framer Motion).
- **Feedback:** Clear success and error feedback.
- **States:** Hover states on interactive elements, subtle button loading states, and loading skeletons for async data.
- **Empty States:** Every page must include meaningful empty states (e.g., "No bookings yet") that encourage the next logical action with a premium design.

## 7. Accessibility
- Keyboard accessible.
- Screen-reader friendly with proper ARIA labels.
- High contrast where required.
- Easy to tap/click target sizes on touch devices.
