/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: {
          950: '#06090E',
          900: '#0B0F17',
          850: '#0F1522',
          800: '#141D2E',
          750: '#1A253A',
          700: '#212E46',
          600: '#324363',
          500: '#4A5E82',
        },
        steel: {
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
        },
        cyan: {
          glow: '#38BDF8',
          accent: '#0EA5E9',
          dark: '#0369A1'
        },
        hazard: {
          light: '#FDE68A',
          DEFAULT: '#F59E0B',
          dark: '#B45309'
        },
        nominal: {
          light: '#A7F3D0',
          DEFAULT: '#10B981',
          dark: '#047857'
        },
        critical: {
          light: '#FECACA',
          DEFAULT: '#EF4444',
          dark: '#B91C1C'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        'technical': '0 0 0 1px rgba(51, 65, 85, 0.5), 0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'cyan-glow': '0 0 20px -5px rgba(14, 165, 233, 0.3)',
        'hazard-glow': '0 0 20px -5px rgba(245, 158, 11, 0.3)',
      },
      backgroundImage: {
        'technical-grid': 'radial-gradient(rgba(51, 65, 85, 0.25) 1px, transparent 1px)',
        'scanline': 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
      }
    },
  },
  plugins: [],
}
