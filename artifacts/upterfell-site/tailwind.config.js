export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg': '#0D0D1F', 'bg2': '#0A0A1A', 'accent': '#FE60A0',
        'purple': '#7B5CFF', 'gold': '#E65100', 'text': '#F5F0E8',
      },
      fontFamily: { display: ['Cinzel','serif'], body: ['Inter','sans-serif'] },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
};
