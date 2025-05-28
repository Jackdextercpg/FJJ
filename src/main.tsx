import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ChampionshipProvider } from './contexts/ChampionshipContext';
import { SupabaseProvider } from './contexts/SupabaseContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <SupabaseProvider>
        <ChampionshipProvider>
          <App />
        </ChampionshipProvider>
      </SupabaseProvider>
    </BrowserRouter>
  </StrictMode>
);