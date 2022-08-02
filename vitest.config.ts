import { UserConfigExport } from 'vite';
import { C8Options } from 'vitest';
import { defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig({
    test: {
        globals: true,
        root: 'src',
        environment: 'jsdom',
        setupFiles: [
            '@testing-library/jest-dom',
            '@testing-library/react/dont-cleanup-after-each'
        ],
        reporters: ['junit', 'verbose'],
        outputFile: {
            junit: '__reports__/junit.json'
        },
        testTimeout: 30_000,
        coverage: {
            reportsDirectory: '__reports__/coverage',
            reporter: ['text', 'text-summary', 'lcov', 'cobertura', 'json'],
            exclude: [
                'index.ts',
                'main.tsx',
                '.d.ts',
                '.mock.ts',
                '.config.ts',
                '__tests__',
                '__mocks__',
                '__fixtures__',
                '__reports__'
            ]
        } as C8Options
    },
    ...viteConfig
} as UserConfigExport);
