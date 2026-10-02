/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        guava: {
          greenLight: '#eef8ed',  // Soft outer rind wash background
          rind: '#58a757',        // Natural lush outer green skin
          rindDark: '#2d6a33',    // Forest guava stem tone
          pinkLight: '#fdf2f2',   // Delicate sweet flesh backdrop
          pink: '#f46a78',        // Ripe pink guava core
          pinkDeep: '#dc3545',    // Rich guava seed blush
          yellowRind: '#c2db52',  // Sun-kissed pale yellow-green rind accent
        }
      },
      keyframes: {
        guavaFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-6px) rotate(3deg)' },
        },
        guavaPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
        }
      },
      animation: {
        guavaBounce: 'guavaFloat 2s ease-in-out infinite',
        guavaSpinPulse: 'guavaPulse 1.2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
