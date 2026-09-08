// Tailwind CDN Browser Theme Configuration
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        primaryHover: '#1d4ed8',
        textDark: '#1e293b',
        textBody: '#475569',
        bgLight: '#f8fafc',
        evnBlue: '#29348f',
        evnRed: '#DB0D0D',
        evnOrange: '#ea580c',
        warmCream: '#f8efe3',
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-10deg)' },
          '50%': { transform: 'rotate(10deg)' },
        }
      },
      animation: {
        wiggle: 'wiggle 1s ease-in-out infinite',
      }
    },
  },
};
