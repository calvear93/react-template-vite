import { createContext } from 'react';

/** What a DropdownMenu gives its items: how to close it, giving the focus back. */
export const DropdownMenuContext = createContext<(() => void) | null>(null);
