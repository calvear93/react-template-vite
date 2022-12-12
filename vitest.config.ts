import { CoverageC8Options } from 'vitest';
import { UserConfigExport } from 'vitest/config';
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
			junit: '.reports/junit.json'
		},
		testTimeout: 12_000,
		coverage: {
			reportsDirectory: '.reports/coverage',
			reporter: ['text', 'text-summary', 'lcov', 'cobertura', 'json'],
			exclude: [
				'index.ts',
				'main.tsx',
				'.d.ts',
				'.mock.ts',
				'.config.ts',
				'__tests__',
				'__mocks__',
				'__fixtures__'
			]
		} as CoverageC8Options
	},
	...viteConfig
} as UserConfigExport;
