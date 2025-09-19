import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Start MSW in development
// src/main.ts
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // dynamic import so msw isn't pulled into SSR/server builds
  import('./lib/mock-api')
    .then(({ worker }) => worker.start())
    .catch(err => {
      console.warn('MSW failed to start:', err);
    });
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
