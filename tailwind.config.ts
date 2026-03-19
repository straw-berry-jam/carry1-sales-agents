import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#142F5A',
        gold: {
          light: '#FFCE99',
          DEFAULT: '#D9A86C',
          dark: '#BD7D3D',
        },
        plum: {
          dark: '#142F5A',
          DEFAULT: '#142F5A',
        },
        gradient: {
          red: '#FFCE99',
          purple: '#BD7D3D',
        },
        cream: '#FFFFF8',
        glass: {
          border: 'rgba(255, 206, 153, 0.3)',
          bg: 'rgba(255, 255, 255, 0.1)',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui'],
        heading: ['Montserrat', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(90deg, #FFCE99, #BD7D3D)',
        'gradient-gold': 'linear-gradient(90deg, #FFCE99, #BD7D3D)',
        'gradient-landing': 'linear-gradient(90deg, #FFCE99, #BD7D3D)',
        'gradient-landing-muted': 'linear-gradient(90deg, #D9A86C, #BD7D3D)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glow': '0 4px 16px rgba(189, 125, 61, 0.4)',
        'glow-landing': '0 4px 16px rgba(189, 125, 61, 0.4)',
        'glow-landing-muted': '0 4px 16px rgba(217, 168, 108, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
