import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import svg from 'vite-plugin-svgr';
import stylelint from 'vite-plugin-stylelint';
import { createHtmlPlugin as html } from 'vite-plugin-html';

// https://vitejs.dev/config/
export default defineConfig({
    base: process.env.VITE_APP_BASE_PATH,
    server: {
        open: true,
        https: process.env.HTTPS === 'true',
        port: +process.env.PORT!
    },
    build: {
        sourcemap: process.env.GENERATE_SOURCEMAP === 'true',
        minify: true
    },
    plugins: [
        react(),
        tsconfigPaths(),
        checker({ typescript: true }),
        svg(),
        stylelint(),
        html({
            inject: {
                data: process.env
            },
            minify: true
        })
    ]
});
