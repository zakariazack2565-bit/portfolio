import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { emUrl } from './data';

(window as unknown as { emUrl: typeof emUrl }).emUrl = emUrl;   // the unchanged effects script (fx.js) calls this global
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
