import { beforeAll, describe, expect, test } from 'vitest';
import { FeatureFlagHandler } from './feature-flag.handler.ts';

describe(FeatureFlagHandler, () => {
	// hooks
	beforeAll(() => {
		const handler = new FeatureFlagHandler({
			V1: true,
		});
	});

	// tests
	test('test', () => {
		expect(1).toBe(1);
	});
});
