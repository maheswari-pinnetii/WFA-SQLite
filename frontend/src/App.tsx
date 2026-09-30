import React from 'react';
import { AppProvider } from './app/providers/AppProvider';
import { AppRoutes } from './app/routes/AppRoutes';
import { ErrorBoundary } from './shared/components/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
