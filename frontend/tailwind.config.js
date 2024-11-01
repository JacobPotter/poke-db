/** @type {import('tailwindcss').Config} */

import defaultTheme from 'tailwindcss/defaultTheme';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        screens: {
            'xxs': '300px',
            'xs': '414px',
            ...defaultTheme.screens,
        },
        extend: {
            fontFamily: {
                mono: ["Source Code Pro", "monospace"],
                monofett: "Monofett"
            },
            screens: {
                '3xl': '1920px',
            },
            fontSize: {
                'xxs': ['0.6rem', '0.8rem'],
            }
        },
    },
    plugins: [],
}

