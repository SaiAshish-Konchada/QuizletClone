module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}',  // Ensure this includes all your files
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],  // This will set Poppins as your default sans font
      },
    },
  },
  plugins: [],
};
