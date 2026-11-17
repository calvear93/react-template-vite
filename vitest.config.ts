import type { ViteUserConfig } from 'vitest/config';

export default {
	clearScreen: false,
	test: {
		environment: 'happy-dom',
		include: ['src/**/*.{spec,test}.?(c|m)[jt]s?(x)'],
		// what failed, and the files not fully covered: no report for a pipeline
		reporters: ['default'],
		benchmark: {
			include: ['src/**/*.{bench,benchmark}.?(c|m)[jt]s?(x)'],
		},
		coverage: {
			include: ['src/**/*.?(c|m)[jt]s?(x)'],
			reporter: [['text', { skipFull: true }], 'text-summary'],
			reportsDirectory: '.reports/coverage',
			exclude: [
				'src/app/[Aa]pp*.?(c|m)[jt]s?(x)',
				'**/*.{d,config,mock,fixture,interface,bench}.?(c|m)[jt]s?(x)',
				'**/{index,main}.?(c|m)[jt]s?(x)',
				'**/__{tests,mocks,fixtures}__/**/*',
			],
		},
		setupFiles: [
			'@testing-library/react/dont-cleanup-after-each',
			'@testing-library/jest-dom/vitest',
			// the parts of the UI kit a browser loads on demand, there from the start
			'src/libs/ui-core/__mocks__/preload.setup.ts',
		],
	},
} satisfies ViteUserConfig;
