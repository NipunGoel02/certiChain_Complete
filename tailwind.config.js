/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        xl: '1520px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Ensuring Inter font is used
      },
      colors: {
        // Pure Purple Primary Palette
        primary: {
          50: '#FBF8FF',    // Very light purple tint
          100: '#F5F3FF',   // Lighter purple
          200: '#EBE6FF',
          300: '#D6CCFF',
          400: '#C9A7F0',   // Start of your specified gradient
          500: '#A775E5',   // Middle of your specified gradient
          600: '#8C5CC4',   // End of your specified gradient
          700: '#7A4EB0',   // Darker shade for backgrounds
          800: '#683F9C',
          900: '#4F2D78',   // Deepest purple
        },
        secondary: { // Keeping a neutral grey for text contrast
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        accent: { // A complementary accent color (e.g., for highlights or specific buttons)
          50: '#FFE6F0', // Light pink/rose
          100: '#FFCCD9',
          200: '#FF99B3',
          300: '#FF668C',
          400: '#FF3366',
          500: '#E51A4D', // Main accent (e.g., vibrant rose)
          600: '#CB0033',
          700: '#B2002A',
          800: '#990022',
          900: '#7A001A',
        },
      },
      boxShadow: {
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'button': '0 4px 6px -1px rgba(136, 76, 200, 0.2), 0 2px 4px -1px rgba(136, 76, 200, 0.1)', // Adjusted button shadow to purple
        'inner-lg': 'inset 0 2px 4px rgba(0,0,0,0.06)',
        '3xl': '0 20px 40px rgba(0, 0, 0, 0.25)',
        '4xl': '0 30px 60px rgba(0, 0, 0, 0.35)',
        '5xl': '0 40px 80px rgba(0, 0, 0, 0.45)', // Even more pronounced for CTA
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem', // Added for more rounded elements
      },
      backgroundImage: {
        'certi-gradient-purple': 'linear-gradient(90deg, #C9A7F0 0%, #A775E5 50%, #8C5CC4 100%)',
        'certi-gradient-dark-purple': 'linear-gradient(90deg, #8C5CC4 0%, #7A4EB0 50%, #683F9C 100%)', // Darker purple gradient
        'certi-gradient-cta': 'linear-gradient(90deg, #4F2D78 0%, #331A99 100%)', // Deepest purple for CTA
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'certificate-float': 'certificateFloat 4s ease-in-out infinite',
        'loading': 'loading 3s infinite',
        'scale-in': 'scaleIn 0.5s ease-out',
        'blob-slow': 'blob 7s infinite cubic-bezier(0.6, 0.01, 0.3, 0.9)',
        'pulse-bg': 'pulse-bg 8s infinite ease-in-out',
      },
      keyframes: {
        certificateFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        loading: {
          '0%': { width: '0%' },
          '50%': { width: '70%' },
          '100%': { width: '100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'pulse-bg': {
          '0%, 100%': { transform: 'scale(0.95)', opacity: '0.2' },
          '50%': { transform: 'scale(1.05)', opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
}