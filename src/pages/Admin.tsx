import React, { useState } from 'react';
import { Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom';
import { Shield, Users, Percent as Soccer, Trophy, CreditCard, Lock } from 'lucide-react';
import { useChampionship } from '../contexts/ChampionshipContext';

// Admin sub-pages
import AdminDashboard from './admin/AdminDashboard';
import AdminTeams from './admin/AdminTeams';
import AdminPlayers from './admin/AdminPlayers';
import AdminMatches from './admin/AdminMatches';
import AdminTransfers from './admin/AdminTransfers';
import AdminChampions from './admin/AdminChampions';

const Admin: React.FC = () => {
  const { championship } = useChampionship();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'fjj123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Senha incorreta');
    }
  };

  const getActiveClass = ({ isActive }: { isActive: boolean }) => {
    return isActive 
      ? "flex items-center gap-2 text-white bg-primary/80 rounded-md px-3 py-2"
      : "flex items-center gap-2 text-gray-700 hover:bg-primary/10 rounded-md px-3 py-2";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="card w-full max-w-md p-8">
          <div className="flex justify-center mb-6">
            <Lock className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Acesso Administrativo</h2>
          
          <form onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-center">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Senha</label>
              <input
                type="password"
                className="input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary w-full">
              Acessar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Shield className="mr-2 text-primary" />
        Painel Administrativo
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="card p-4 mb-4">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">
              Gerenciamento
            </h2>
            <nav className="space-y-2">
              <NavLink to="/admin" className={getActiveClass} end>
                <Shield size={18} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/admin/teams" className={getActiveClass}>
                <Users size={18} />
                <span>Times</span>
              </NavLink>
              <NavLink to="/admin/players" className={getActiveClass}>
                <Users size={18} />
                <span>Jogadores</span>
              </NavLink>
              <NavLink to="/admin/matches" className={getActiveClass}>
                <Soccer size={18} />
                <span>Jogos</span>
              </NavLink>
              <NavLink to="/admin/transfers" className={getActiveClass}>
                <CreditCard size={18} />
                <span>Transferências</span>
              </NavLink>
              <NavLink to="/admin/champions" className={getActiveClass}>
                <Trophy size={18} />
                <span>Edições Passadas</span>
              </NavLink>
            </nav>
          </div>
          
          <div className="card p-4">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">
              Status do Campeonato
            </h2>
            <div className="mb-4">
              {championship ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">Nome:</span> {championship.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Temporada:</span> {championship.season}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Status:</span>{' '}
                    {championship.status === 'setup' && 'Em configuração'}
                    {championship.status === 'group' && 'Fase de grupos em andamento'}
                    {championship.status === 'knockout' && 'Fase eliminatória'}
                    {championship.status === 'finished' && 'Finalizado'}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Times:</span> {championship.teams.length}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum campeonato ativo</p>
              )}
            </div>
            <Link to="/admin" className="btn btn-primary w-full text-sm">
              Gerenciar Campeonato
            </Link>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <div className="card">
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="teams" element={<AdminTeams />} />
              <Route path="players" element={<AdminPlayers />} />
              <Route path="matches" element={<AdminMatches />} />
              <Route path="transfers" element={<AdminTransfers />} />
              <Route path="champions" element={<AdminChampions />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;