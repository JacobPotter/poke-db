/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                mono: ["Source Code Pro", "monospace"],
                monofett: "Monofett"
            },
        },
    },
    plugins: [],
}

