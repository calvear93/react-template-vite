import { type RefObject, useEffect, useRef, useState } from 'react';
import { useOutsidePress } from '../../internal/use-outside-press.hook.ts';

/** Storage key of the side bar left folded (absent: unfolded). */
export const SHELL_FOLDED_STORAGE_KEY = 'ui.shell.folded';

/** From this width the side bar is part of the page, not a panel over it. */
const WIDE_QUERY = '(width > 900px)';

const readFolded = () => {
	try {
		return localStorage.getItem(SHELL_FOLDED_STORAGE_KEY) === 'true';
	} catch {
		// storage blocked (site data off by policy): the shell opens unfolded
		return false;
	}
};

const writeFolded = (isFolded: boolean) => {
	try {
		localStorage.setItem(SHELL_FOLDED_STORAGE_KEY, String(isFolded));
	} catch {
		// storage blocked: the fold applies but is not remembered
	}
};

/**
 * The behaviour of an AppShell: its side bar folded to icons (remembered per
 * browser) or open over the page on a narrow screen, where Escape, a press
 * outside of it or a wider window close it; and a new page, which closes it and
 * starts at its top.
 *
 * @param options - the key of the page shown, and the elements the focus moves between
 *
 * @returns whether the side bar is folded or open, and the functions that change it
 */
export const useAppShell = ({
	main,
	menuButton,
	navigation,
	pageKey,
	sidebar,
}: {
	main: RefObject<HTMLElement | null>;
	menuButton: RefObject<HTMLElement | null>;
	navigation: RefObject<HTMLElement | null>;
	pageKey: string | undefined;
	sidebar: RefObject<HTMLElement | null>;
}) => {
	const shownPage = useRef(pageKey);
	const returnsFocus = useRef(false);
	const [isFolded, setIsFolded] = useState(readFolded);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [lastPageKey, setLastPageKey] = useState(pageKey);

	// another page: the menu of a narrow screen has done its part
	if (pageKey !== lastPageKey) {
		setLastPageKey(pageKey);
		setIsMenuOpen(false);
	}

	// another page starts at its top, the focus on its content
	useEffect(() => {
		if (shownPage.current === pageKey) return;

		shownPage.current = pageKey;
		main.current?.focus({ preventScroll: true });
		main.current?.scrollTo({ top: 0 });
	}, [main, pageKey]);

	// the header is inert while the panel is open: its button takes the focus back once it is not
	useEffect(() => {
		if (isMenuOpen || !returnsFocus.current) return;

		returnsFocus.current = false;
		menuButton.current?.focus();
	}, [isMenuOpen, menuButton]);

	// the rest of the page is inert while the panel is open: a press on it closes the panel
	useOutsidePress(isMenuOpen, [sidebar], () => setIsMenuOpen(false));

	useEffect(() => {
		if (!isMenuOpen) return;

		const wide = matchMedia(WIDE_QUERY);

		// opening moves the focus into the menu: its first link
		navigation.current?.querySelector('a')?.focus();

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || event.defaultPrevented) return;

			returnsFocus.current = true;
			setIsMenuOpen(false);
		};

		// a window that grows wide has the side bar in the page again: no panel to keep open
		const handleResize = () => {
			if (wide.matches) setIsMenuOpen(false);
		};

		document.addEventListener('keydown', handleKeyDown);
		wide.addEventListener('change', handleResize);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			wide.removeEventListener('change', handleResize);
		};
	}, [isMenuOpen, menuButton, navigation]);

	return {
		isFolded,
		isMenuOpen,
		toggleMenu: () => setIsMenuOpen(!isMenuOpen),
		closeMenu: (returnFocus = false) => {
			returnsFocus.current = returnFocus;
			setIsMenuOpen(false);
		},
		toggleFold: () => {
			writeFolded(!isFolded);
			setIsFolded(!isFolded);
		},
	};
};
