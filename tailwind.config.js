/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#DC2626', // Red-600
                    dark: '#991B1B', // Red-800
                },
                dark: {
                    900: '#0a0a0a',
                    800: '#171717',
                    700: '#262626',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
