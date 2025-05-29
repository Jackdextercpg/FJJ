import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { ChampionshipProvider } from './contexts/ChampionshipContext';
import { RealtimeSync } from './components/common/RealtimeSync';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Teams from './pages/Teams';
import Matches from './pages/Matches';
import Standings from './pages/Standings';
import TopScorers from './pages/TopScorers';
import Transfers from './pages/Transfers';
import Champions from './pages/Champions';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import PlayerProfile from './pages/PlayerProfile';

function App() {
  return (
    <SupabaseProvider>
        <ChampionshipProvider>
          <RealtimeSync />
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="teams" element={<Teams />} />
                  <Route path="matches" element={<Matches />} />
                  <Route path="standings" element={<Standings />} />
                  <Route path="top-scorers" element={<TopScorers />} />
                  <Route path="transfers" element={<Transfers />} />
                  <Route path="champions" element={<Champions />} />
                  <Route path="player/:id" element={<PlayerProfile />} />
                  <Route path="admin/*" element={<Admin />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Layout>
          </Router>
        </ChampionshipProvider>
    </SupabaseProvider>
  );
}

export default App;