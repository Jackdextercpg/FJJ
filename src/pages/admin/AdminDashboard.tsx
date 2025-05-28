import React, { useState } from 'react';
import { Trophy, AlertTriangle, PlayCircle, Zap, CheckCircle2, Users, CreditCard, Percent as Soccer, Trash2, PlusCircle } from 'lucide-react';
import { useChampionship } from '../../contexts/ChampionshipContext';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { 
    championship, 
    teams, 
    matches, 
    players,
    pastChampions,
    createChampionship, 
    startChampionship,
    advanceToKnockout,
    resetChampionship,
    calculateStandings,
    getTopScorers,
    getTeamById,
    updateChampionship
  } = useChampionship();
  
  const [newChampionship, setNewChampionship] = useState({
    name: '',
    season: new Date().getFullYear().toString(),
    maxTeams: 6,
    scheduleType: 'random' as 'random' | 'manual'
  });

  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleCreateChampionship = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!newChampionship.name || !newChampionship.season) {
      setError('Preencha todos os campos');
      return;
    }

    if (selectedTeams.length > newChampionship.maxTeams) {
      setError(`Selecione no máximo ${newChampionship.maxTeams} times`);
      return;
    }
    
    try {
      const newChamp = createChampionship(
        newChampionship.name, 
        newChampionship.season,
        newChampionship.maxTeams,
        newChampionship.scheduleType
      );
      
      // Add selected teams to the championship
      updateChampionship({
        ...newChamp,
        teams: selectedTeams
      });

      setSuccess('Campeonato criado com sucesso');
      setNewChampionship({
        name: '',
        season: new Date().getFullYear().toString(),
        maxTeams: 6,
        scheduleType: 'random'
      });
      setSelectedTeams([]);
    } catch (err) {
      setError('Erro ao criar campeonato');
    }
  };

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeams(prev => {
      if (prev.includes(teamId)) {
        return prev.filter(id => id !== teamId);
      }
      if (prev.length >= newChampionship.maxTeams) {
        return prev;
      }
      return [...prev, teamId];
    });
  };
  
  const handleStartChampionship = () => {
    setError(null);
    setSuccess(null);
    
    if (!championship) {
      setError('Nenhum campeonato criado');
      return;
    }
    
    if (championship.teams.length !== championship.maxTeams) {
      setError(`O campeonato precisa ter exatamente ${championship.maxTeams} times para começar`);
      return;
    }
    
    try {
      startChampionship();
      setSuccess('Campeonato iniciado com sucesso! Fase de grupos gerada.');
    } catch (err) {
      setError('Erro ao iniciar o campeonato');
    }
  };
  
  const handleAdvanceToKnockout = () => {
    setError(null);
    setSuccess(null);
    
    if (!championship) {
      setError('Nenhum campeonato ativo');
      return;
    }
    
    const groupMatches = matches.filter(m => m.stage === 'group');
    const unplayedMatches = groupMatches.filter(m => !m.played);
    
    if (unplayedMatches.length > 0) {
      setError(`Ainda existem ${unplayedMatches.length} jogos da fase de grupos pendentes`);
      return;
    }
    
    try {
      advanceToKnockout();
      setSuccess('Avançado para a fase eliminatória com sucesso!');
    } catch (err) {
      setError('Erro ao avançar para a fase eliminatória');
    }
  };
  
  const handleDeleteChampionship = () => {
    if (confirm('Tem certeza que deseja excluir o campeonato? Esta ação não pode ser desfeita.')) {
      resetChampionship();
      setSuccess('Campeonato excluído com sucesso');
    }
  };

  const renderChampionshipStatus = () => {
    if (!championship) {
      return (
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Criar Novo Campeonato</h2>
          
          <form onSubmit={handleCreateChampionship}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nome do Campeonato</label>
              <input
                type="text"
                className="input w-full"
                placeholder="FJJ Brasileirão Série A"
                value={newChampionship.name}
                onChange={(e) => setNewChampionship(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Temporada</label>
              <input
                type="text"
                className="input w-full"
                placeholder="2023"
                value={newChampionship.season}
                onChange={(e) => setNewChampionship(prev => ({ ...prev, season: e.target.value }))}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Número de Times</label>
              <select
                className="input w-full"
                value={newChampionship.maxTeams}
                onChange={(e) => setNewChampionship(prev => ({ ...prev, maxTeams: parseInt(e.target.value) }))}
              >
                <option value={6}>6 Times</option>
                <option value={8}>8 Times</option>
                <option value={10}>10 Times</option>
                <option value={16}>16 Times</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Tipo de Agendamento</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="scheduleType"
                    value="random"
                    checked={newChampionship.scheduleType === 'random'}
                    onChange={(e) => setNewChampionship(prev => ({ ...prev, scheduleType: e.target.value as 'random' | 'manual' }))}
                    className="mr-2"
                  />
                  Randomizar Jogos
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="scheduleType"
                    value="manual"
                    checked={newChampionship.scheduleType === 'manual'}
                    onChange={(e) => setNewChampionship(prev => ({ ...prev, scheduleType: e.target.value as 'random' | 'manual' }))}
                    className="mr-2"
                  />
                  Definir Manualmente
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Selecione os Times ({selectedTeams.length}/{newChampionship.maxTeams} times necessários)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {teams.map(team => (
                  <div
                    key={team.id}
                    className={`card p-4 cursor-pointer transition-all ${
                      selectedTeams.includes(team.id)
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleTeamSelect(team.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{team.name}</span>
                      {selectedTeams.includes(team.id) && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Times selecionados: {selectedTeams.length}/{newChampionship.maxTeams}
              </p>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={selectedTeams.length !== newChampionship.maxTeams}
            >
              Criar Campeonato
            </button>
          </form>
        </div>
      );
    }
    
    if (championship.status === 'setup') {
      return (
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Trophy className="mr-2 text-secondary" />
            {championship.name} - {championship.season}
          </h2>
          
          <div className="mb-4">
            <p className="mb-2">Status: <span className="font-medium">Em configuração</span></p>
            <p className="mb-2">Times cadastrados: <span className="font-medium">{championship.teams.length} / {championship.maxTeams}</span></p>
          </div>
          
          <div className="mb-4">
            {teams.length < championship.maxTeams ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Você precisa cadastrar pelo menos {championship.maxTeams} times para iniciar o campeonato.
                    </p>
                    <Link to="/admin/teams" className="text-sm font-medium text-yellow-700 underline">
                      Cadastrar times
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleStartChampionship} 
                className="btn btn-primary w-full flex items-center justify-center"
              >
                <PlayCircle className="mr-2 w-5 h-5" />
                Iniciar Campeonato
              </button>
            )}
          </div>

          <button 
            onClick={handleDeleteChampionship}
            className="btn btn-outline text-red-500 hover:bg-red-50 w-full flex items-center justify-center mt-4"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Campeonato
          </button>
        </div>
      );
    }
    
    if (championship.status === 'group') {
      const groupMatches = matches.filter(m => m.stage === 'group');
      const playedMatches = groupMatches.filter(m => m.played);
      const progress = groupMatches.length > 0 
        ? Math.round((playedMatches.length / groupMatches.length) * 100)
        : 0;
      
      return (
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Trophy className="mr-2 text-secondary" />
            {championship.name} - {championship.season}
          </h2>
          
          <div className="mb-4">
            <p className="mb-2">Status: <span className="font-medium">Fase de grupos em andamento</span></p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {playedMatches.length} de {groupMatches.length} jogos realizados ({progress}%)
            </p>
          </div>
          
          <div className="mb-4">
            {playedMatches.length === groupMatches.length ? (
              <button 
                onClick={handleAdvanceToKnockout} 
                className="btn btn-primary w-full flex items-center justify-center"
              >
                <Zap className="mr-2 w-5 h-5" />
                Avançar para Fase Eliminatória
              </button>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Finalize todos os jogos da fase de grupos para avançar.
                    </p>
                    <Link to="/admin/matches" className="text-sm font-medium text-yellow-700 underline">
                      Atualizar resultados de jogos
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleDeleteChampionship}
            className="btn btn-outline text-red-500 hover:bg-red-50 w-full flex items-center justify-center mt-4"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Campeonato
          </button>
        </div>
      );
    }
    
    if (championship.status === 'knockout') {
      const knockoutMatches = matches.filter(m => m.stage === 'semifinal' || m.stage === 'final');
      const playedMatches = knockoutMatches.filter(m => m.played);
      const progress = knockoutMatches.length > 0 
        ? Math.round((playedMatches.length / knockoutMatches.length) * 100)
        : 0;
      
      return (
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Trophy className="mr-2 text-secondary" />
            {championship.name} - {championship.season}
          </h2>
          
          <div className="mb-4">
            <p className="mb-2">Status: <span className="font-medium">Fase eliminatória em andamento</span></p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {playedMatches.length} de {knockoutMatches.length} jogos realizados ({progress}%)
            </p>
          </div>
          
          <div className="mb-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Finalize todos os jogos da fase eliminatória para determinar o campeão.
                  </p>
                  <Link to="/admin/matches" className="text-sm font-medium text-yellow-700 underline">
                    Atualizar resultados de jogos
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleDeleteChampionship}
            className="btn btn-outline text-red-500 hover:bg-red-50 w-full flex items-center justify-center mt-4"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Campeonato
          </button>
        </div>
      );
    }
    
    if (championship.status === 'finished') {
      const championTeam = championship.winner ? getTeamById(championship.winner) : null;
      
      return (
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Trophy className="mr-2 text-secondary" />
            {championship.name} - {championship.season} (Finalizado)
          </h2>
          
          <div className="mb-4">
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Campeonato finalizado! Campeão: {championTeam?.name || 'Desconhecido'}
                  </p>
                  <Link to="/champions" className="text-sm font-medium text-green-700 underline">
                    Ver histórico de campeões
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleDeleteChampionship} 
            className="btn btn-outline text-red-500 hover:bg-red-50 w-full flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Campeonato
          </button>
        </div>
      );
    }
    
    return null;
  };

  const renderDashboardStats = () => {
    const standings = championship && championship.status !== 'setup' ? calculateStandings() : [];
    const topScorers = championship && championship.status !== 'setup' ? getTopScorers(1) : [];
    const topScorer = topScorers.length > 0 ? topScorers[0] : null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <h3 className="font-bold mb-3">Resumo</h3>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="text-gray-600">Times:</span>
              <span className="font-medium">{teams.length}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Jogadores:</span>
              <span className="font-medium">{players.length}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Partidas:</span>
              <span className="font-medium">{matches.length}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Jogos realizados:</span>
              <span className="font-medium">{matches.filter(m => m.played).length}</span>
            </p>
          </div>
        </div>
        
        <div className="card p-4">
          <h3 className="font-bold mb-3">Destaques</h3>
          <div className="space-y-2">
            {standings.length > 0 && (
              <p className="flex justify-between">
                <span className="text-gray-600">Líder:</span>
                <span className="font-medium">
                  {getTeamById(standings[0]?.teamId)?.name || 'N/A'}
                </span>
              </p>
            )}
            {topScorer && (
              <p className="flex justify-between">
                <span className="text-gray-600">Artilheiro:</span>
                <span className="font-medium">
                  {topScorer.name} ({topScorer.goals} gols)
                </span>
              </p>
            )}
            <p className="flex justify-between">
              <span className="text-gray-600">Edições anteriores:</span>
              <span className="font-medium">{pastChampions.length}</span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Dashboard Administrativo</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      {renderChampionshipStatus()}
      
      {renderDashboardStats()}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin/teams" className="card p-6 hover:shadow-md transition-shadow">
          <Users className="w-8 h-8 text-primary mb-2" />
          <h3 className="text-lg font-semibold mb-1">Gerenciar Times</h3>
          <p className="text-sm text-gray-600">Adicionar, editar e remover times do campeonato</p>
        </Link>
        
        <Link to="/admin/players" className="card p-6 hover:shadow-md transition-shadow">
          <Users className="w-8 h-8 text-primary mb-2" />
          <h3 className="text-lg font-semibold mb-1">Gerenciar Jogadores</h3>
          <p className="text-sm text-gray-600">Adicionar, editar e remover jogadores dos times</p>
        </Link>
        
        <Link to="/admin/matches" className="card p-6 hover:shadow-md transition-shadow">
          <Soccer className="w-8 h-8 text-primary mb-2" />
          <h3 className="text-lg font-semibold mb-1">Gerenciar Jogos</h3>
          <p className="text-sm text-gray-600">Inserir resultados e marcar gols de jogadores</p>
        </Link>
        
        <Link to="/admin/transfers" className="card p-6 hover:shadow-md transition-shadow">
          <CreditCard className="w-8 h-8 text-primary mb-2" />
          <h3 className="text-lg font-semibold mb-1">Gerenciar Transferências</h3>
          <p className="text-sm text-gray-600">Transferir jogadores entre times</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;