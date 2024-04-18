export const FEATURE_CHANGED_EVENT = 'feature_changed';

export class FeatureChangedEvent extends Event {
	constructor(readonly changedFlags?: Record<string, boolean>) {
		super(FEATURE_CHANGED_EVENT);
	}
}
