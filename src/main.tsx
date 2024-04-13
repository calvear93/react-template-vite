import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'uno.css';
import 'virtual:unocss-devtools';
import { App } from './app/App.tsx';

const root = createRoot(document.getElementById('app')!);

root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
