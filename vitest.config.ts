import type { ViteUserConfig } from 'vitest/config';

/**
 * The list of every test and the coverage reports (lcov, Cobertura, JSON) are
 * written in a pipeline only (GitHub Actions and most CIs set CI): a run on a
 * desk says what failed and what is not covered.
 */
const IN_PIPELINE = Boolean(process.env.CI);

export default {
	clearScreen: false,
	test: {
		environment: 'happy-dom',
		include: ['src/**/*.{spec,test}.?(c|m)[jt]s?(x)'],
		reporters: IN_PIPELINE ? ['verbose'] : ['default'],
		benchmark: {
			include: ['src/**/*.{bench,benchmark}.?(c|m)[jt]s?(x)'],
		},
		coverage: {
			include: ['src/**/*.?(c|m)[jt]s?(x)'],
			reportsDirectory: '.reports/coverage',
			exclude: [
				'src/app/[Aa]pp*.?(c|m)[jt]s?(x)',
				'**/*.{d,config,mock,fixture,interface,bench}.?(c|m)[jt]s?(x)',
				'**/{index,main}.?(c|m)[jt]s?(x)',
				'**/__{tests,mocks,fixtures}__/**/*',
			],
			reporter: IN_PIPELINE
				? ['text', 'text-summary', 'lcov', 'cobertura', 'json']
				: [['text', { skipFull: true }], 'text-summary'],
		},
		setupFiles: [
			'@testing-library/react/dont-cleanup-after-each',
			'@testing-library/jest-dom/vitest',
		],
	},
} satisfies ViteUserConfig;
