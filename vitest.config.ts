import { checker } from 'vite-plugin-checker';
import type { UserConfigExport } from 'vitest/config';

export default {
	clearScreen: false,
	plugins: [
		checker({
			terminal: true,
			typescript: true,
			eslint: {
				dev: { logLevel: ['error'] },
				lintCommand: 'eslint --cache',
				useFlatConfig: true,
			},
		}),
	] as any,
	test: {
		environment: 'happy-dom',
		include: ['src/**/*.{spec,test}.?(c|m)[jt]s?(x)'],
		reporters: ['verbose'],
		benchmark: {
			include: ['src/**/*.{bench,benchmark}.?(c|m)[jt]s?(x)'],
		},
		coverage: {
			include: ['src/**/*.?(c|m)[jt]s?(x)'],
			reporter: ['text', 'text-summary', 'lcov', 'cobertura', 'json'],
			reportsDirectory: '.reports/coverage',
			exclude: [
				'**/*.{d,config,mock,fixture,interface,bench}.?(c|m)[jt]s?(x)',
				'**/{index,main}.?(c|m)[jt]s?(x)',
				'**/__{tests,mocks,fixtures}__/**/*',
			],
		},
		setupFiles: [
			'@testing-library/react/dont-cleanup-after-each',
			'@testing-library/jest-dom/vitest',
		],
	},
} satisfies UserConfigExport;
