import React from 'react';
import { scan } from 'react-scan';

if (typeof window !== 'undefined') {
  scan({
    enabled: process.env.NODE_ENV === 'development',
  });
}
import ReactDOM from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import App from './App';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
