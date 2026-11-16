/**
 * Thrown when a piece of the kit is used outside of the component that gives it
 * its context: a hook that needs UiProvider (useConfirm), a Tab outside of Tabs.
 *
 * @remarks exceptions are expected behavior on certain situations,
 *  meanwhile errors are critical problems should stop application.
 */
export class UiContextException extends Error {
	constructor(provider = 'UiProvider') {
		super(`${provider} must wrap current context`);
	}
}
