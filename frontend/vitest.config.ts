import {coverageConfigDefaults, defineConfig} from 'vitest/config'
import svgr from "vite-plugin-svgr";

export default defineConfig(
    {
        plugins: [svgr()],
        test: {

            coverage: {
                provider: "v8",
                include: ["src/**/*.{ts,tsx}"],
                exclude: ["src/main.tsx", "src/constants/**", "src/**/stories/**", ...coverageConfigDefaults.exclude]
            },
            browser: {
                enabled: true,
                name: 'chromium',
                provider: 'playwright',
                // https://playwright.dev
                providerOptions: {playwright: {launch: {devtools: true}}},

            },
            css: true,
            setupFiles: ['./src/setupTests.ts'],
            includeTaskLocation: true,
            // environment: 'jsdom',
            // server: {
            //     deps: {
            //         inline: ['vitest-canvas-mock'],
            //     }
            // },
            // // For this config, check https://github.com/vitest-dev/vitest/issues/740
            //
            // environmentOptions: {
            //     jsdom: {
            //         resources: 'usable',
            //     },
            // },
            // globals: true,

            // For this config, check https://github.com/vitest-dev/vitest/issues/740

        },


    },
)
