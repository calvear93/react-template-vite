import { UserConfigExport } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import css from 'vite-plugin-windicss';
import checker from 'vite-plugin-checker';
import svg from 'vite-plugin-svgr';
import stylelint from 'vite-plugin-stylelint';
import { createHtmlPlugin as html } from 'vite-plugin-html';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';

// https://vitejs.dev/config/
export default {
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
        css(),
        tsconfigPaths(),
        checker({ typescript: true }),
        svg(),
        stylelint(),
        html({
            inject: {
                data: process.env
            },
            minify: true
        }),
        chunkSplitPlugin({
            strategy: 'single-vendor',
            customSplitting: {
                react: [
                    'react',
                    'react-dom',
                    'redux',
                    'react-redux',
                    'react-router-dom'
                ],
                libs: [/src\/libs/]
            }
        })
    ]
} as UserConfigExport;
