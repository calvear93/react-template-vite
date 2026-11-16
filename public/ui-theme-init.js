// The theme, the contrast, the motion, the text size and the links of the page before its first
// paint, so a dark page never flashes white and nothing animates for someone who asked it not
// to. A classic script in the <head> of index.html: a file, not an inline script, because the
// Content-Security-Policy runs only scripts of the app. Same keys and rules as
// src/libs/ui-core/theme/theme.store.ts, which keeps them in step afterwards (a spec runs both).
(() => {
	const read = (key) => {
		try {
			return globalThis.localStorage.getItem(key);
		} catch {
			return null; // storage blocked: the system's theme and contrast
		}
	};
	const matches = (query) => globalThis.matchMedia(query).matches;
	const root = globalThis.document.documentElement;
	const theme = read('ui.theme');
	const contrast = read('ui.contrast');
	const motion = read('ui.motion');
	const isDark =
		theme === 'dark' ||
		(theme !== 'light' && matches('(prefers-color-scheme: dark)'));

	root.dataset.theme = isDark ? 'dark' : 'light';

	if (
		contrast === 'more' ||
		(contrast !== 'normal' && matches('(prefers-contrast: more)'))
	)
		root.dataset.contrast = 'more';

	root.dataset.motion =
		motion === 'reduce' ||
		(motion !== 'full' && matches('(prefers-reduced-motion: reduce)'))
			? 'reduce'
			: 'full';

	if (read('ui.text') === 'large') root.dataset.text = 'large';

	if (read('ui.links') === 'underline') root.dataset.links = 'underline';
})();
