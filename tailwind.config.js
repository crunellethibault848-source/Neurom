/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#080A0F',
          secondary: '#0E1117',
          tertiary: '#151B24',
          card: '#111620',
          hover: '#1A2130',
        },
        brand: {
          DEFAULT: '#4DFFC3',
          dim: '#1A4D3A',
          glow: 'rgba(77, 255, 195, 0.15)',
        },
        text: {
          primary: '#E8EDF5',
          secondary: '#8A95A8',
          muted: '#4A5568',
        },
        border: {
          DEFAULT: '#1E2635',
          bright: '#2A3548',
        },
        accent: {
          blue: '#4D9FFF',
          purple: '#9D6FFF',
          red: '#FF4D6A',
          yellow: '#FFD44D',
        }
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-clash)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(77, 255, 195, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 255, 195, 0.03) 1px, transparent 1px)`,
        'brand-gradient': 'linear-gradient(135deg, #4DFFC3 0%, #4D9FFF 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(77, 255, 195, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(77, 255, 195, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}
