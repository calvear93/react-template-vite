import { useEffect, useEffectEvent, useState } from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import {
	onDemand,
	tellNotLoaded,
	useOnDemand,
} from '../../internal/on-demand.ts';

/**
 * The window of the settings: no page shows it when it opens, so its code and its
 * styles arrive when it is first opened, or ahead once the browser is idle.
 */
export const SETTINGS_WINDOW = onDemand(() => import('./SettingsWindow.tsx'));

/**
 * The window of a SettingsDialog, loaded on demand: nothing until it first opens
 * and its code is there, the same window from then on (closed, it keeps the
 * category it was left on and plays its way out). An opening whose window cannot
 * be loaded is told to the person and asks to close; the next one loads again.
 *
 * @param open - whether the dialog is open
 * @param onOpenChange - asks the app to close it
 *
 * @returns what the window loaded, or nothing while there is none to draw
 */
export const useSettingsWindow = (
	open: boolean,
	onOpenChange: (open: boolean) => void,
) => {
	const loaded = useOnDemand(SETTINGS_WINDOW);
	const [wasOpened, setWasOpened] = useState(open);
	const { onDemand: notLoaded } = useTexts();

	if (open && !wasOpened) setWasOpened(true);

	const giveUp = useEffectEvent(() => {
		tellNotLoaded(notLoaded);
		onOpenChange(false);
	});

	useEffect(() => SETTINGS_WINDOW.prefetch(), []);

	useEffect(() => {
		if (!open) return;

		let isWaitedFor = true;

		const load = async () => {
			try {
				await SETTINGS_WINDOW.load();
			} catch {
				// closed meanwhile: nobody waits for it any more
				if (isWaitedFor) giveUp();
			}
		};

		void load();

		return () => {
			isWaitedFor = false;
		};
	}, [open]);

	return wasOpened ? loaded : undefined;
};
