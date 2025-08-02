import { createContainer } from '#libs/ioc';

/**
 * Defines dependencies for inject in your components.
 * Use 'useInjection'0 hook for resolve inside them.
 */
export const { InversionOfControlProvider, container, useInjection } =
	createContainer();

// define dependencies
container.bind('injectionToken', { example: 'demo' });
