import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'app/App';
import 'virtual:windi.css';

const root = createRoot(document.getElementById('app')!);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
