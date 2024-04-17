export const FEATURE_FLAG_CHANGED_EVENT = 'feature_changed';

export class FeatureFlagChangedEvent extends Event {
	constructor(readonly flag?: string) {
		super(FEATURE_FLAG_CHANGED_EVENT);
	}
}
