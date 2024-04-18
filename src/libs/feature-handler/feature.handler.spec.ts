import { beforeAll, describe, expect, test } from 'vitest';
import { FeatureHandler } from './feature.handler.ts';

describe(FeatureHandler, () => {
	// hooks
	beforeAll(() => {
		const handler = new FeatureHandler({
			V1: true,
		});
	});

	// tests
	test('test', () => {
		expect(1).toBe(1);
	});
});
