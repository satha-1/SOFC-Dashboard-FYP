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
        // Custom SOFC color palette
        'sofc': {
          'bg': '#EFECE3',
          'primary': '#4A70A9',
          'secondary': '#8FABD4',
          'text': '#000000',
          'dark-bg': '#1a1d23',
          'dark-card': '#252830',
          'dark-border': '#363a45',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'flow': 'flow 2s linear infinite',
        'flow-reverse': 'flowReverse 2s linear infinite',
        'rotate-slow': 'rotate 3s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'breathe': 'breathe 2s ease-in-out infinite',
        'particle': 'particle 1.5s linear infinite',
        'particle-reverse': 'particleReverse 1.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        flowReverse: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(74, 112, 169, 0.5), 0 0 10px rgba(74, 112, 169, 0.3)' },
          '100%': { boxShadow: '0 0 15px rgba(74, 112, 169, 0.8), 0 0 25px rgba(74, 112, 169, 0.5)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        particle: {
          '0%': { transform: 'translateX(0) translateY(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(32px) translateY(-4px)', opacity: '0' },
        },
        particleReverse: {
          '0%': { transform: 'translateX(32px) translateY(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(0) translateY(-4px)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

