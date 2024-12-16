import {coverageConfigDefaults, defineConfig} from 'vitest/config'
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(
    {
        plugins: [react(), svgr(), tsconfigPaths()],
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
