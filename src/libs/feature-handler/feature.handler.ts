import {
	FEATURE_CHANGED_EVENT,
	FeatureChangedEvent,
} from './events/feature-changed.event.ts';

export type FeatureOnChangeListener = (
	this: EventSource,
	event: FeatureChangedEvent,
) => void;

export type FeatureLookup = Record<string, boolean | undefined>;

export class FeatureHandler {
	addOnChangeListener(action: FeatureOnChangeListener): void {
		this._emitter.addEventListener(FEATURE_CHANGED_EVENT, action as any);
	}

	get(feature: string): boolean {
		return !!this._features[feature];
	}

	getAll(): Readonly<FeatureLookup> {
		return this._features;
	}

	removeOnChangeListener(action: FeatureOnChangeListener): void {
		this._emitter.removeEventListener(FEATURE_CHANGED_EVENT, action as any);
	}

	set(feature: string, value: boolean): void {
		const willChange = this._willChange(feature, value);

		this._features[feature] = value;

		if (willChange)
			this._emitter.dispatchEvent(
				new FeatureChangedEvent({ [feature]: value }),
			);
	}

	setAll(features: FeatureLookup): void {
		let isChanged = false;
		const changedFeatures: Record<string, boolean> = {};

		for (const feature in features) {
			const value = !!features[feature];

			if (this._willChange(feature, value)) {
				changedFeatures[feature] = value;
				isChanged = true;
			}
		}

		if (!isChanged) return;

		this._features = {
			...this._features,
			...changedFeatures,
		};

		this._emitter.dispatchEvent(new FeatureChangedEvent(changedFeatures));
	}

	private _willChange(feature: string, value: boolean) {
		return !!this._features[feature] !== value;
	}

	constructor(private _features: FeatureLookup = {}) {}

	/**
	 * Event sourcing for change propagation
	 */
	private _emitter = new EventTarget();

	static fromArray(features: string[]): FeatureLookup {
		return features.reduce<FeatureLookup>((features, feature) => {
			features[feature] = true;
			return features;
		}, {});
	}
}
