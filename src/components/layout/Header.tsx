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
              <h1 className="text-xl font-bold text-primary">FJJ BRASILEIRÃO</h1>
              <p className="text-xs font-semibold text-secondary">SÉRIE A</p>
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