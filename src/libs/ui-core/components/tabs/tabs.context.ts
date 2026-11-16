import { createContext } from 'react';

/** What Tabs shares with its list, its tabs and its panels. */
export interface TabsContextValue {
	/** The base of the ids that tie each tab to its panel. */
	baseId: string;
	orientation: 'horizontal' | 'vertical';
	/** The value of the selected tab. */
	value: string | undefined;
	select: (value: string) => void;
}

export const TabsContext = createContext<TabsContextValue | null>(null);
