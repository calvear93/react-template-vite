import type { UserConfigExport } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default {
	plugins: [tsconfigPaths()],
	test: {
		coverage: {
			all: true,
			exclude: [
				'**/*.{d,config,mock,fixture}.{ts,cts,mts,tsx}',
				'**/{index,main}.{ts,cts,mts,tsx}',
				'**/__{tests,mocks,fixtures}__',
			],
			include: ['src/**/*.{ts,cts,mts,tsx}'],
			reporter: ['text', 'text-summary', 'lcov', 'cobertura', 'json'],
			reportsDirectory: '.reports/coverage',
		},
		environment: 'jsdom',
		include: ['src/**/*.{spec,test}.{ts,cts,mts,tsx}'],
		reporters: ['verbose'],
		setupFiles: ['@testing-library/react/dont-cleanup-after-each'],
		silent: false,
		testTimeout: 6000,
	},
} satisfies UserConfigExport;
