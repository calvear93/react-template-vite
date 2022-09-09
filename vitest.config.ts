import { UserConfigExport } from 'vite';
import { CoverageC8Options } from 'vitest';
import viteConfig from './vite.config';

export default {
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
        } as CoverageC8Options
    },
    ...viteConfig
} as UserConfigExport;
