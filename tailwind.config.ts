import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e1a',
        'card-bg': 'rgba(255,255,255,0.05)',
        'card-border': 'rgba(255,255,255,0.1)',
        primary: '#00E5FF',
        gold: '#FFD700',
        'text-primary': '#E8EAF0',
        'text-secondary': '#8892A4',
        error: '#FF4444',
        success: '#00C853',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
