import {
	FEATURE_FLAG_CHANGED_EVENT,
	FeatureFlagChangedEvent,
} from './events/feature-flag-changed.event.ts';

export type FeatureFlagOnChangeListener = (
	this: EventSource,
	event: FeatureFlagChangedEvent,
) => void;

export type FeatureFlagsLookup = Record<string, boolean | undefined>;

// TODO: localstorage with namespace for get query params

export class FeatureFlagHandler {
	addOnChangeListener(action: FeatureFlagOnChangeListener) {
		this._emitter.addEventListener(FEATURE_FLAG_CHANGED_EVENT, action);
	}

	get(flag: string): boolean {
		return !!this._flags[flag];
	}

	getAll(): FeatureFlagsLookup {
		return this._flags;
	}

	removeOnChangeListener(action: FeatureFlagOnChangeListener) {
		this._emitter.removeEventListener(FEATURE_FLAG_CHANGED_EVENT, action);
	}

	set(flag: string, value: boolean): void {
		const willChange = this._willChange(flag, value);

		this._flags[flag] = value;

		if (willChange)
			this._emitter.dispatchEvent(new FeatureFlagChangedEvent(flag));
	}

	setAll(flags: FeatureFlagsLookup): FeatureFlagsLookup {
		return (this._flags = {
			...this._flags,
			...flags,
		});
	}

	private _willChange(flag: string, value: boolean) {
		return !!this._flags[flag] !== value;
	}

	constructor(private _flags: FeatureFlagsLookup) {}

	private _emitter = new EventTarget();
}
