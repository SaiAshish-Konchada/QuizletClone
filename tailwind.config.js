module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}',  // Ensure this includes all your files
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],  // This will set Poppins as your default sans font
      },
      gridTemplateColumns: {
        13: 'repeat(13, minmax(0, 1fr))', // Adds support for 13 columns
      },
    },
  },
  plugins: [],
};
