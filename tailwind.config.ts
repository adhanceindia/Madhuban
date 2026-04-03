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
        // Brand primary green
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
        // Gold accent
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
        // Status colors
        status: {
          confirmed: '#16a34a',
          pending: '#d97706',
          cancelled: '#dc2626',
          'checked-in': '#2563eb',
          blocked: '#6b7280',
        },
        // Legacy alias (used by footer, navbar, etc.)
        'primary-dark': '#2f590b',
        // Semantic tokens
        background: '#f8f9f4',
        foreground: '#111827',
        border: '#e5e7eb',
        input: '#e5e7eb',
        ring: '#386a0e',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#111827',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#111827',
        },
        secondary: {
          DEFAULT: '#f3f4f6',
          foreground: '#111827',
        },
        muted: {
          DEFAULT: '#f3f4f6',
          foreground: '#6b7280',
        },
        accent: {
          DEFAULT: '#386a0e',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
        // Sidebar tokens
        sidebar: {
          DEFAULT: '#ffffff',
          foreground: '#334155',
          primary: '#386a0e',
          'primary-foreground': '#ffffff',
          accent: '#f0fdf4',
          'accent-foreground': '#111827',
          border: '#e5e7eb',
          ring: '#386a0e',
          muted: '#f1f5f9',
        },
        // Chart colors
        chart: {
          1: '#386a0e',
          2: '#2f590b',
          3: '#6aad3a',
          4: '#a3d47a',
          5: '#6b7a5e',
        },
        // Warm surface palette
        'warm-cream': '#fffdf8',
        'warm-sand': '#f6f3eb',
        'warm-base': '#fbf9f4',
        'warm-gray': '#f5f3ee',
        'warm-green': '#f8fbf4',
        // Accent surfaces
        'badge-green': '#eaf3de',
        'filter-idle': '#efede7',
        'filter-hover': '#e5e3dd',
        // Borders
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
