module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#186F65',
        secondary: '#4FC9E9',
        accent: '#F4D35E',
        neutral: '#444F5A',
        background: '#F9F9F9',
        darkBackground: '#121212',t
        darkPrimary: '#0B3D33',
        darkSecondary: '#1E3E59',
      },
      fontFamily: {
        heading: ['Montserrat', 'ui-sans-serif', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'sans-serif'],
      },
      animation: {
        fadein: "fadeIn 0.5s ease-in forwards",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
