/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        // Primary theme colors - Blue to Indigo to Violet gradient
        primary: {
          50: '#eff6ff',   // blue-50
          100: '#dbeafe',  // blue-100
          200: '#bfdbfe',  // blue-200
          300: '#93c5fd',  // blue-300
          400: '#60a5fa',  // blue-400
          500: '#3b82f6',  // blue-500
          600: '#2563eb',  // blue-600
          700: '#1d4ed8',  // blue-700
          800: '#1e40af',  // blue-800
          900: '#1e3a8a',  // blue-900
        },
        secondary: {
          50: '#eef2ff',   // indigo-50
          100: '#e0e7ff',  // indigo-100
          200: '#c7d2fe',  // indigo-200
          300: '#a5b4fc',  // indigo-300
          400: '#818cf8',  // indigo-400
          500: '#6366f1',  // indigo-500
          600: '#4f46e5',  // indigo-600
          700: '#4338ca',  // indigo-700
          800: '#3730a3',  // indigo-800
          900: '#312e81',  // indigo-900
        },
        accent: {
          50: '#f5f3ff',   // violet-50
          100: '#ede9fe',  // violet-100
          200: '#ddd6fe',  // violet-200
          300: '#c4b5fd',  // violet-300
          400: '#a78bfa',  // violet-400
          500: '#8b5cf6',  // violet-500
          600: '#7c3aed',  // violet-600
          700: '#6d28d9',  // violet-700
          800: '#5b21b6',  // violet-800
          900: '#4c1d95',  // violet-900
        }
      },
      backgroundImage: {
        'gradient-mahajana-light': 'linear-gradient(45deg, #1f2937, #1e40af, #4338ca)',
        'gradient-mahajana-dark': 'linear-gradient(45deg, #ffffff, #93c5fd, #a5b4fc)',
        'gradient-bakery-light': 'linear-gradient(45deg, #2563eb, #7c3aed)',
        'gradient-bakery-dark': 'linear-gradient(45deg, #60a5fa, #a78bfa)',
        'gradient-primary': 'linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6)',
        'gradient-primary-dark': 'linear-gradient(135deg, #1e40af, #4338ca, #6d28d9)',
      },
      animation: {
        'fadeInUp': 'fadeInUp 1s ease-out',
        'fadeInDown': 'fadeInDown 1s ease-out',
        'slideInLeft': 'slideInLeft 1s ease-out',
        'slideInRight': 'slideInRight 1s ease-out',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'orbFloat': 'orbFloat 10s ease-in-out infinite',
        'gridMove': 'gridMove 20s linear infinite',
        'logoSpin': 'logoSpin 4s ease-in-out infinite',
        'buttonGlow': 'buttonGlow 2s ease-in-out infinite alternate',
        'cardFloat': 'cardFloat 6s ease-in-out infinite',
        'iconBounce': 'iconBounce 3s ease-in-out infinite',
        'floatSlow': 'floatSlow 12s ease-in-out infinite',
      },
      dropShadow: {
        'glow-blue': '0 0 20px rgba(147, 197, 253, 0.3)',
        'glow-blue-light': '0 0 20px rgba(30, 64, 175, 0.2)',
      },
      boxShadow: {
        'text-blue': '0 0 50px rgba(99, 102, 241, 0.5)',
        'text-blue-light': '0 0 50px rgba(59, 130, 246, 0.4)',
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.bg-clip-text': {
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
        },
        '.text-fill-transparent': {
          '-webkit-text-fill-color': 'transparent',
          'color': 'transparent',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

