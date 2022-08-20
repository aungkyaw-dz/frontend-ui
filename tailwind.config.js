module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'nav_background': "url('../asset/images/nav_background.png')" ,
        'footer_background': "url('../asset/images/footer_background.png')" 
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ]
}
