/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface:          '#0c0c0e',
        'surface-raised': '#131318',
        'surface-variant':'#1a1a22',
        'on-surface':     '#f0ede8',
        'on-surface-muted':'#8b8b99',
        accent:           '#e8b84b',
        'accent-dim':     '#a07d28',
        silver:           '#94a3b8',
        outline:          '#2a2a35',
      },
      fontFamily: {
        serif:  ['"DM Serif Display"', 'Georgia', 'serif'],
        mono:   ['"JetBrains Mono"', 'monospace'],
        sans:   ['Sora', 'sans-serif'],
      },
      backgroundImage: {
        'ruled': "repeating-linear-gradient(180deg, transparent, transparent 27px, rgba(148,163,184,0.06) 27px, rgba(148,163,184,0.06) 28px)",
      },
    },
  },
  plugins: [],
}
