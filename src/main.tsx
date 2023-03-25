import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { App } from 'app/App';
import 'uno.css';
import 'virtual:unocss-devtools';

const root = createRoot(document.getElementById('app')!);

root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
