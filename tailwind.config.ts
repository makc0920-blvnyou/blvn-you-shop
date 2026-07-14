import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9B7ED9',
        'primary-light': '#B8A0E5',
        'primary-dark': '#7D5FC7',
        background: '#FAF7FF',
        surface: '#FFFFFF',
        'text-primary': '#2D2D2D',
        'text-secondary': '#6B6B6B',
        accent: '#FFB6C1',
        'accent-light': '#FFD6DE',
        success: '#98D8C8',
        blvn: {
          pink: '#C44D7D',
          'pink-light': '#FFB6C1',
          sakura: '#FFB7C5',
          lantern: '#FF8C42',
          green: '#4A7C59',
          cream: '#FFF5ED',
          lavender: '#E6E6FA',
        },
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        button: '24px',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0,0,0,0.08)',
        'soft-lg': '0 8px 30px rgba(0,0,0,0.12)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-gentle': 'pulse-gentle 4s ease-in-out infinite',
        'sakura-fall': 'sakura-fall linear infinite',
        'hero-zoom': 'hero-zoom 20s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        'sakura-fall': {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)' },
        },
        'hero-zoom': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
