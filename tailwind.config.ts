import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand garden green — reserved for brand mark + dark text accent
        primary: {
          DEFAULT: '#386a0e',
          foreground: '#ffffff',
          light: '#eef4e7',
          deep: '#356609',
          50: '#f2f9ec',
          100: '#e3f2d4',
          200: '#a3d47a',
          300: '#6aad3a',
          400: '#4a8a1a',
          500: '#386a0e',
          600: '#2f590b',
          700: '#264808',
          800: '#1e3806',
          900: '#152804',
        },
        // Lime-yellow — the signature accent (Lodgify-style)
        // Active sidebar pill, primary CTAs, chart highlights, status pills
        accent: {
          DEFAULT: '#d6ed5e',
          foreground: '#1a1f12',
          soft: '#ecf5b8',
          deep: '#b8d04a',
          50: '#fbfde6',
          100: '#f5f9c4',
          200: '#ecf5b8',
          300: '#d6ed5e',
          400: '#b8d04a',
          500: '#9ab53b',
          600: '#7c942e',
          700: '#5e7322',
          800: '#3f5217',
          900: '#1f300b',
        },
        // Sage — secondary surfaces, KPI card tints, donut segments
        sage: {
          DEFAULT: '#c8d9b0',
          foreground: '#1a1f12',
          soft: '#eef4e1',
          deep: '#6b8e3d',
          50: '#f5f7ed',
          100: '#eef4e1',
          200: '#dfe9c8',
          300: '#c8d9b0',
          400: '#a8c082',
          500: '#88a55c',
          600: '#6b8e3d',
          700: '#52702a',
          800: '#3a521c',
          900: '#23330f',
        },
        // Gold/brass — revenue accents
        gold: {
          DEFAULT: '#ba7517',
          dark: '#a46612',
          light: '#fef3c7',
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#d4922e',
          500: '#ba7517',
          600: '#a46612',
          700: '#8a540e',
          800: '#704409',
          900: '#5a3607',
        },
        // Status colors — Lodgify-aligned with soft bg + colored text
        status: {
          'confirmed': '#5a8a2e',
          'confirmed-bg': '#e0eccc',
          'checked-in': '#7c942e',
          'checked-in-bg': '#f0f7c8',
          'pending': '#d4a017',
          'pending-bg': '#f7ebbc',
          'cancelled': '#e85d5d',
          'cancelled-bg': '#fce5e5',
          'blocked': '#8a8a8a',
          'blocked-bg': '#eeeeee',
          'maintenance': '#c97b2e',
          'maintenance-bg': '#fce8d4',
        },
        // Legacy alias
        'primary-dark': '#2f590b',
        // Semantic tokens — warm sage-cream background
        background: '#f5f7ed',
        foreground: '#1a1f12',
        border: '#e5e9d8',
        input: '#e5e9d8',
        ring: '#b8d04a',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1a1f12',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#1a1f12',
        },
        secondary: {
          DEFAULT: '#eef4e1',
          foreground: '#1a1f12',
        },
        muted: {
          DEFAULT: '#eef4e1',
          foreground: '#6b7355',
        },
        destructive: {
          DEFAULT: '#e85d5d',
          foreground: '#ffffff',
        },
        // Sidebar tokens — pale sage bg, lime active pill
        sidebar: {
          DEFAULT: '#f5f7ed',
          foreground: '#6b7355',
          primary: '#d6ed5e',
          'primary-foreground': '#1a1f12',
          accent: '#eef4e1',
          'accent-foreground': '#1a1f12',
          border: '#e5e9d8',
          ring: '#b8d04a',
          muted: '#dfe9c8',
        },
        // Chart palette — Lodgify lime + sage + gold mix
        chart: {
          1: '#d6ed5e',
          2: '#b8d04a',
          3: '#c8d9b0',
          4: '#6b8e3d',
          5: '#ba7517',
        },
        // Warm surface palette (kept for public-side compatibility)
        'warm-cream': '#fffdf8',
        'warm-sand': '#f6f3eb',
        'warm-base': '#fbf9f4',
        'warm-gray': '#f5f3ee',
        'warm-green': '#f8fbf4',
        // Accent surfaces (kept)
        'badge-green': '#eaf3de',
        'filter-idle': '#efede7',
        'filter-hover': '#e5e3dd',
        // Borders (kept)
        'content-border': '#d9e2cf',
        'divider': '#ddd9cf',
        'card-accent': '#c0dd97',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        card: '2rem',
        'card-md': '1.75rem',
        'card-inner': '1.5rem',
        'card-sm': '1.2rem',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        admin: ['var(--font-admin)', 'sans-serif'],
        'admin-mono': ['var(--font-admin-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        eyebrow: '0.35em',
        label: '0.24em',
        tag: '0.2em',
      },
      spacing: {
        navbar: '92px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
