import type { UserConfigExport } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import svg from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react-swc';

export default {
	test: {
		globals: true,
		silent: false,
		environment: 'jsdom',
		include: ['src/**/*.{spec,test}.{ts,cts,mts,tsx}'],
		setupFiles: [
			'@testing-library/jest-dom',
			'@testing-library/react/dont-cleanup-after-each',
		],
		reporters: ['junit', 'verbose'],
		outputFile: {
			junit: '.reports/junit.xml',
		},
		testTimeout: 12_000,
		coverage: {
			all: true,
			reportsDirectory: '.reports/coverage',
			reporter: ['text', 'text-summary', 'lcov', 'cobertura', 'json'],
			include: ['src/**/*.{ts,cts,mts,tsx}'],
			exclude: [
				'**/*.d.{ts,cts,mts,tsx}',
				'**/*.mock.{ts,cts,mts,tsx}',
				'**/*.config.{ts,cts,mts,tsx}',
				'**/{index,main}.{ts,cts,mts,tsx}',
				'**/__{tests,mocks,fixtures}__',
			],
		},
	},
	plugins: [react(), svg(), tsconfigPaths()],
} satisfies UserConfigExport;
