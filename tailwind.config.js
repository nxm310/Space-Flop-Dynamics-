/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sc: {
          dark: '#0a0d14',
          panel: 'var(--sc-panel, #101726)',
          card: 'var(--sc-card, #162035)',
          border: 'var(--sc-border, #1f2f4e)',
          cyan: 'var(--sc-cyan, #00d2ff)',
          glow: 'var(--sc-cyan-glow, rgba(0, 210, 255, 0.35))',
          teal: '#00f0ff',
          gold: '#f5a623',
          orange: '#ff6b35',
          red: '#ff3b5c',
          green: '#00e676',
          purple: '#b388ff',
          muted: '#6b7f9e'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        sans: ['"Rajdhani"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': 'var(--sc-neon-shadow, 0 0 15px rgba(0, 210, 255, 0.35))',
        'neon-gold': '0 0 15px rgba(245, 166, 35, 0.35)',
        'neon-green': '0 0 15px rgba(0, 230, 118, 0.35)',
        'neon-red': '0 0 15px rgba(255, 59, 92, 0.35)',
        'neon-purple': '0 0 15px rgba(179, 136, 255, 0.35)',
      }
    },
  },
  plugins: [],
}
