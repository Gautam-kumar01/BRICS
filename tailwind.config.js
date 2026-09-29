/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm Canvas & Ivory Surface Palette
        canvas: {
          50: '#fdfcfb',  // Pure Ivory
          100: '#faf6f0', // Soft Linen / Peach Tint
          200: '#f4ede4', // Warm Sand Cream
          300: '#e8dbcc', // Muted Biscuit
          400: '#d5c2ad', // Warm Stone
        },
        // Rich Typography & Charcoal Depth
        ink: {
          950: '#0c0a09', // Deepest Obsidian
          900: '#1c1917', // Primary Charcoal Headline
          800: '#292524', // Deep Espresso
          700: '#44403c', // Secondary Body
          600: '#57534e', // Muted Text
          500: '#78716c', // Tertiary Text
          400: '#a8a29e', // Border / Inactive
          300: '#d6d3d1', // Light Border
          200: '#e7e5e4', // Hairline Border
          100: '#f5f5f4', // Subtle Tint
          50: '#fafaf9',  // Off White
        },
        // Civic Amber & Vibrant Orange Accents (from screenshot)
        civic: {
          orange: '#f97316',
          'orange-dark': '#ea580c',
          'orange-light': '#fb923c',
          'orange-soft': '#fff7ed',
          amber: '#f59e0b',
          'amber-dark': '#d97706',
          'amber-soft': '#fefce8',
          gold: '#eab308',
          sand: '#d4a373',
          terracotta: '#c2410c',
        },
        // Backward compatibility for brics color keys
        brics: {
          950: '#1c1917',
          900: '#292524',
          850: '#44403c',
          800: '#57534e',
          700: '#78716c',
          600: '#a8a29e',
          500: '#d6d3d1',
          400: '#e7e5e4',
          300: '#f5f5f4',
          200: '#fafaf9',
          100: '#44403c',
          50: '#ffffff',
        },
        electric: {
          500: '#f97316',
          400: '#fb923c',
          300: '#fed7aa',
          cyan: '#0284c7',
        },
        pulse: {
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
          orange: '#ea580c',
          gold: '#eab308',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'glow-orange': '0 8px 25px -4px rgba(249, 115, 22, 0.35)',
        'glow-amber': '0 8px 25px -4px rgba(245, 158, 11, 0.3)',
        'glow-gold': '0 8px 25px -4px rgba(234, 179, 8, 0.25)',
        'glass': '0 10px 35px -5px rgba(28, 25, 23, 0.06), 0 4px 12px -2px rgba(28, 25, 23, 0.03)',
        'card': '0 4px 20px -2px rgba(28, 25, 23, 0.05), 0 2px 6px -1px rgba(28, 25, 23, 0.03)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
