/** Tailwind CDN browser config — must use tailwind.config, NOT module.exports */
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cinzel', 'serif'],
        sans: ['Inter', 'sans-serif']
      },
      colors: {
        forge: {
          950: '#050505',
          900: '#0a0a0a',
          850: '#17191b',
          800: '#171717',
          700: '#262626',
          accent: '#d97706',
          light: '#e5e5e5'
        }
      }
    }
  }
}