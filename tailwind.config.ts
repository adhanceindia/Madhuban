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
        primary: {
          DEFAULT: '#4CAF50',
          foreground: '#ffffff',
        },
        'primary-dark': '#2e7d32',
        background: '#f5f9f0',
        foreground: '#1a1a1a',
        border: '#d6e4d0',
        input: '#d6e4d0',
        ring: '#4CAF50',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1a',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1a',
        },
        secondary: {
          DEFAULT: '#ecf4e6',
          foreground: '#1a1a1a',
        },
        muted: {
          DEFAULT: '#edf3e8',
          foreground: '#4b5c49',
        },
        accent: {
          DEFAULT: '#2e7d32',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#b42318',
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
