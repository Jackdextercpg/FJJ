import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Trophy, Percent as Soccer, Users, CalendarDays, LineChart, TrendingUp, History, Shield } from 'lucide-react';
import { useChampionship } from '../../contexts/ChampionshipContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { championship } = useChampionship();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getActiveClass = ({ isActive }: { isActive: boolean }) => {
    return isActive 
      ? "flex items-center gap-2 text-white bg-primary/80 rounded-md px-3 py-2"
      : "flex items-center gap-2 text-gray-700 hover:bg-primary/10 rounded-md px-3 py-2";
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-primary">FJJ</h1>
              <p className="text-xs font-semibold text-secondary">Campeonatos</p>
            </div>
          </Link>

          {/* Championship status indicator */}
          {championship && (
            <div className="hidden md:block bg-gray-100 px-3 py-1 rounded-full text-sm">
              {championship.status === 'setup' && 'Aguardando início'}
              {championship.status === 'group' && 'Fase de grupos em andamento'}
              {championship.status === 'knockout' && 'Fase eliminatória'}
              {championship.status === 'finished' && 'Campeonato finalizado'}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/" className={getActiveClass} end>
              <Shield size={18} />
              <span>Início</span>
            </NavLink>
            <NavLink to="/teams" className={getActiveClass}>
              <Users size={18} />
              <span>Times</span>
            </NavLink>
            <NavLink to="/matches" className={getActiveClass}>
              <Soccer size={18} />
              <span>Jogos</span>
            </NavLink>
            <NavLink to="/standings" className={getActiveClass}>
              <LineChart size={18} />
              <span>Classificação</span>
            </NavLink>
            <NavLink to="/top-scorers" className={getActiveClass}>
              <TrendingUp size={18} />
              <span>Artilharia</span>
            </NavLink>
            <NavLink to="/transfers" className={getActiveClass}>
              <CalendarDays size={18} />
              <span>Transferências</span>
            </NavLink>
            <NavLink to="/champions" className={getActiveClass}>
              <History size={18} />
              <span>Campeões</span>
            </NavLink>
            <NavLink to="/admin" className={getActiveClass}>
              <Shield size={18} />
              <span>Admin</span>
            </NavLink>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <ul className="space-y-2">
              <li>
                <NavLink 
                  to="/" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                  end
                >
                  <Shield size={18} />
                  <span>Início</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/teams" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                >
                  <Users size={18} />
                  <span>Times</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/matches" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                >
                  <Soccer size={18} />
                  <span>Jogos</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/standings" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                >
                  <LineChart size={18} />
                  <span>Classificação</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/top-scorers" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                >
                  <TrendingUp size={18} />
                  <span>Artilharia</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/transfers" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                >
                  <CalendarDays size={18} />
                  <span>Transferências</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/champions" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                >
                  <History size={18} />
                  <span>Campeões</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                >
                  <Shield size={18} />
                  <span>Admin</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
```

```typescript
import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Trophy, Percent as Soccer, Users, CalendarDays, LineChart, TrendingUp, History, Shield } from 'lucide-react';
import { useChampionship } from '../../contexts/ChampionshipContext';
import { useConnectionStatus } from '../../contexts/ConnectionStatusContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { championship } = useChampionship();
  const { isConnected } = useConnectionStatus();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getActiveClass = ({ isActive }: { isActive: boolean }) => {
    return isActive 
      ? "flex items-center gap-2 text-white bg-primary/80 rounded-md px-3 py-2"
      : "flex items-center gap-2 text-gray-700 hover:bg-primary/10 rounded-md px-3 py-2";
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-primary">FJJ</h1>
              <p className="text-xs font-semibold text-secondary">Campeonatos</p>
            </div>
          </Link>

          {/* Championship status indicator */}
          {championship && (
            <div className="hidden md:block bg-gray-100 px-3 py-1 rounded-full text-sm">
              {championship.status === 'setup' && 'Aguardando início'}
              {championship.status === 'group' && 'Fase de grupos em andamento'}
              {championship.status === 'knockout' && 'Fase eliminatória'}
              {championship.status === 'finished' && 'Campeonato finalizado'}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/" className={getActiveClass} end>
              <Shield size={18} />
              <span>Início</span>
            </NavLink>
            <NavLink to="/teams" className={getActiveClass}>
              <Users size={18} />
              <span>Times</span>
            </NavLink>
            <NavLink to="/matches" className={getActiveClass}>
              <Soccer size={18} />
              <span>Jogos</span>
            </NavLink>
            <NavLink to="/standings" className={getActiveClass}>
              <LineChart size={18} />
              <span>Classificação</span>
            </NavLink>
            <NavLink to="/top-scorers" className={getActiveClass}>
              <TrendingUp size={18} />
              <span>Artilharia</span>
            </NavLink>
            <NavLink to="/transfers" className={getActiveClass}>
              <CalendarDays size={18} />
              <span>Transferências</span>
            </NavLink>
            <NavLink to="/champions" className={getActiveClass}>
              <History size={18} />
              <span>Campeões</span>
            </NavLink>
            <NavLink to="/admin" className={getActiveClass}>
              <Shield size={18} />
              <span>Admin</span>
            </NavLink>
            {/* Connection status indicator */}
            <div className="hidden md:block">
              {isConnected ? (
                <span className="text-green-500">Conectado</span>
              ) : (
                <span className="text-red-500">Desconectado</span>
              )}
            </div>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <ul className="space-y-2">
              <li>
                <NavLink 
                  to="/" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                  end
                >
                  <Shield size={18} />
                  <span>Início</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/teams" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                >
                  <Users size={18} />
                  <span>Times</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/matches" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                >
                  <Soccer size={18} />
                  <span>Jogos</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/standings" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                >
                  <LineChart size={18} />
                  <span>Classificação</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/top-scorers" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                >
                  <TrendingUp size={18} />
                  <span>Artilharia</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/transfers" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                >
                  <CalendarDays size={18} />
                  <span>Transferências</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/champions" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                >
                  <History size={18} />
                  <span>Campeões</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin" 
                  className={getActiveClass} 
                  onClick={closeMenu}
                >
                  <Shield size={18} />
                  <span>Admin</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
```

```typescript
// ConnectionStatus.tsx
import React, { useEffect, useState } from 'react';
import { useConnectionStatus } from '../../contexts/ConnectionStatusContext';

const ConnectionStatus: React.FC = () => {
  const { isConnected } = useConnectionStatus();

  return (
    <div>
      {isConnected ? (
        <span className="text-green-500">Conectado</span>
      ) : (
        <span className="text-red-500">Desconectado</span>
      )}
    </div>
  );
};

export default ConnectionStatus;
```

```typescript
// ConnectionStatusContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface ConnectionStatusContextType {
  isConnected: boolean;
}

const ConnectionStatusContext = createContext<ConnectionStatusContextType>({
  isConnected: false,
});

interface ConnectionStatusProviderProps {
  children: React.ReactNode;
}

export const ConnectionStatusProvider: React.FC<ConnectionStatusProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial connection status
    setIsConnected(navigator.onLine);

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Use Supabase Realtime to check connection
    if (supabase) {
      const channel = supabase.channel('connection_status');

      channel.on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
      });

      channel.on('presence', { event: 'leave' }, () => {
        setIsConnected(false);
      });

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const presence = await channel.track({ online_at: new Date().toISOString() });
          setIsConnected(true);
        }
      });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [supabase]);

  return (
    <ConnectionStatusContext.Provider value={{ isConnected }}>
      {children}
    </ConnectionStatusContext.Provider>
  );
};

export const useConnectionStatus = () => {
  return useContext(ConnectionStatusContext);
};
```

```typescript
// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Teams from './pages/Teams';
import Matches from './pages/Matches';
import Standings from './pages/Standings';
import TopScorers from './pages/TopScorers';
import Transfers from './pages/Transfers';
import Champions from './pages/Champions';
import Admin from './pages/Admin';
import { ChampionshipProvider } from './contexts/ChampionshipContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { RealtimeSync } from './components/RealtimeSync';
import { ConnectionStatusProvider } from './contexts/ConnectionStatusContext';

function App() {
  return (
    <SupabaseProvider>
      <ChampionshipProvider>
        <ConnectionStatusProvider>
          <Router>
            <Header />
            <RealtimeSync /> {/* Ensure RealtimeSync is active */}
            <div className="container mx-auto py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/standings" element={<Standings />} />
                <Route path="/top-scorers" element={<TopScorers />} />
                <Route path="/transfers" element={<Transfers />} />
                <Route path="/champions" element={<Champions />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </div>
          </Router>
        </ConnectionStatusProvider>
      </ChampionshipProvider>
    </SupabaseProvider>
  );
}

export default App;
```

```typescript
// RealtimeSync.tsx
import { useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useChampionship } from '../../contexts/ChampionshipContext';

export const RealtimeSync = () => {
  const supabase = useSupabaseClient();
  const { setChampionship } = useChampionship();

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase.channel('championship');

    channel.on('broadcast', { event: 'championship_update' }, (payload) => {
      console.log('Received championship update:', payload.payload);
      setChampionship(payload.payload);
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, setChampionship]);

  return null; // This component doesn't render anything
};
```

```typescript
// SupabaseContext.tsx
import { createClient } from '@supabase/supabase-js';
import { Session } from '@supabase/supabase-js';
import { AuthChangeEvent } from '@supabase/supabase-js';
import {
  useSession,
  useSupabaseClient,
  useUser,
} from '@supabase/auth-helpers-react';
import {
  ReactNode,
  useState,
  useEffect,
  createContext,
  useContext,
} from 'react';

interface SupabaseContextType {
  supabaseClient: any;
  session: Session | null;
  user: any;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabaseClient] = useState(() =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  const session = useSession();
  const user = useUser();

  return (
    <SupabaseContext.Provider value={{ supabaseClient, session, user }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export { useSession, useUser, useSupabaseClient };
```

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

```
[build]
  publish = "dist"
  command = "npm run build"

[dev]
  command = "npm run dev"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

```
npm install @supabase/supabase-js @supabase/auth-helpers-react lucide-react react react-dom react-router-dom
```

```
npm install -D tailwindcss postcss autoprefixer
```

```
npx tailwindcss init -p
```

```
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4ade80',
        secondary: '#a7f3d0',
      },
    },
  },
  plugins: [],
}
```

```
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

```
// index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```typescript
import React, { createContext, useState, useContext } from 'react';

interface ChampionshipContextType {
  championship: any;
  setChampionship: (championship: any) => void;
}

const ChampionshipContext = createContext<ChampionshipContextType>({
  championship: null,
  setChampionship: () => {},
});

interface ChampionshipProviderProps {
  children: React.ReactNode;
}

export const ChampionshipProvider: React.FC<ChampionshipProviderProps> = ({ children }) => {
  const [championship, setChampionship] = useState(null);

  return (
    <ChampionshipContext.Provider value={{ championship, setChampionship }}>
      {children}
    </ChampionshipContext.Provider>
  );
};

export const useChampionship = () => {
  return useContext(ChampionshipContext);
};
```

```typescript
import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const Home: React.FC = () => {
  const [championships, setChampionships] = useState([]);
  const supabase = useSupabaseClient();

  useEffect(() => {
    async function fetchChampionships() {
      const { data, error } = await supabase
        .from('championships')
        .select('*');

      if (error) {
        console.error("Error fetching championships:", error);
      } else {
        setChampionships(data);
      }
    }

    fetchChampionships();
  }, [supabase]);

  return (
    <div>
      <h1>Lista de Campeonatos</h1>
      <ul>
        {championships.map(championship => (
          <li key={championship.id}>{championship.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;