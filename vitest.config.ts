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
            junit: '__reports__/junit.json',
            'vitest-sonar-reporter': '__reports__/sonar-report.xml'
        },
        testTimeout: 30_000,
        coverage: {
            reportsDirectory: '__reports__/coverage'
        } as C8Options
    },
    ...viteConfig
} as UserConfigExport);
