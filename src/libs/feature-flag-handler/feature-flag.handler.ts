export type FeatureFlagHandlerEvent = 'ready' | 'updated';

// TODO: localstorage with namespace for get query params

export class FeatureFlagHandler {
	setFeatureFlag(flag: string, value: boolean) {
		console.log(flag, value);
	}

	constructor(private _lookup: Record<string, boolean>) {}

	private _emitter = new EventTarget();
}

export interface FeatureFlagHandlerConfig {
	stores: [];
}
