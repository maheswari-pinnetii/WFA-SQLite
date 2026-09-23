import React from 'react';
// Temporarily disabled react-scan toolbar
// import { scan } from 'react-scan';
// if (typeof window !== 'undefined') {
//   scan({
//     enabled: process.env.NODE_ENV === 'development',
//   });
// }
import ReactDOM from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import App from './App';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import './index.css';

import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
