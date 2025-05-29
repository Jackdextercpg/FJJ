import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ChampionshipProvider } from './contexts/ChampionshipContext';
import { SupabaseProvider } from './contexts/SupabaseContext';

console.log('🚀 Starting FJJ Brasileirão App...');
console.log('Environment variables:', {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? '✅ Present' : '❌ Missing',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing'
});

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