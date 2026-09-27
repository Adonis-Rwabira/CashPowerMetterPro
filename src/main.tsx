import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './i18n';
import { SettingsProvider } from './contexts/SettingsContext';
import ThemeApplicator from './components/ThemeApplicator';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("L'élément racine #root est introuvable dans le DOM.");
}

const SuspenseFallback = () => (
  <div className="loading-spinner-container">
    <div className="loading-spinner"></div>
  </div>
);

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<SuspenseFallback />}>
        <SettingsProvider>
          <ThemeApplicator>
            <App />
          </ThemeApplicator>
        </SettingsProvider>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
