import { useLocation } from 'react-router';

/**
 * Returns URL hash value.
 *
 * @example
 *	const hash = useHash();
 *
 * @see useLocation from react-router.
 *
 * @returns URL hash.
 */
export const useHashValue = (): string => {
	const { hash } = useLocation();

	return hash.slice(1);
};
