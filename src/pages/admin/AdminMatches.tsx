import React, { useState } from 'react';
import { Percent as Soccer, AlertTriangle, CheckCircle2, Calendar, PlusCircle, Target, Trash2 } from 'lucide-react';
import { useChampionship } from '../../contexts/ChampionshipContext';
import { Match, GoalScorer } from '../../models/types';
import PlayerCard from '../../components/common/PlayerCard';

const AdminMatches: React.FC = () => {
  const { 
    matches, 
    championship, 
    getTeamById, 
    getTeamPlayers,
    updateMatchResult,
    getPlayerById,
    updateMatch,
    addMatch,
    teams
  } = useChampionship();
  
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [resultForm, setResultForm] = useState({
    homeScore: 0,
    awayScore: 0
  });
  
  const [scorers, setScorers] = useState<GoalScorer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [goalCount, setGoalCount] = useState(1);

  const [isAddingMatch, setIsAddingMatch] = useState(false);
  const [newMatch, setNewMatch] = useState({
    homeTeamId: '',
    awayTeamId: '',
    date: new Date().toISOString().split('T')[0],
    matchDay: 1
  });

  const handleAddMatch = () => {
    if (!championship || !newMatch.homeTeamId || !newMatch.awayTeamId || !newMatch.date) {
      setError('Preencha todos os campos');
      return;
    }

    if (newMatch.homeTeamId === newMatch.awayTeamId) {
      setError('Os times não podem ser iguais');
      return;
    }

    try {
      addMatch({
        homeTeamId: newMatch.homeTeamId,
        awayTeamId: newMatch.awayTeamId,
        date: new Date(newMatch.date).toISOString(),
        homeScore: null,
        awayScore: null,
        played: false,
        stage: 'group',
        scorers: [],
        matchDay: newMatch.matchDay,
        isManual: true
      });

      setSuccess('Jogo adicionado com sucesso');
      setIsAddingMatch(false);
      setNewMatch({
        homeTeamId: '',
        awayTeamId: '',
        date: new Date().toISOString().split('T')[0],
        matchDay: 1
      });
    } catch (err) {
      setError('Erro ao adicionar o jogo');
    }
  };
  
  const groupMatches = matches
    .filter(match => match.stage === 'group')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const semifinalMatches = matches
    .filter(match => match.stage === 'semifinal')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const finalMatches = matches
    .filter(match => match.stage === 'final')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const updateFinalTeams = () => {
    const finalMatch = matches.find(m => m.stage === 'final');
    const semifinalMatches = matches.filter(m => m.stage === 'semifinal' && m.played);
    
    if (finalMatch && semifinalMatches.length === 2) {
      const semi1Winner = semifinalMatches[0].homeScore! > semifinalMatches[0].awayScore!
        ? semifinalMatches[0].homeTeamId
        : semifinalMatches[0].awayTeamId;
        
      const semi2Winner = semifinalMatches[1].homeScore! > semifinalMatches[1].awayScore!
        ? semifinalMatches[1].homeTeamId
        : semifinalMatches[1].awayTeamId;
      
      updateMatch({
        ...finalMatch,
        homeTeamId: semi1Winner,
        awayTeamId: semi2Winner
      });
    }
  };

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    setResultForm({
      homeScore: match.homeScore || 0,
      awayScore: match.awayScore || 0
    });
    setScorers(match.scorers || []);
    setError(null);
    setSuccess(null);
    setSelectedPlayer(null);
    setGoalCount(1);
  };
  
  const handleCloseMatchForm = () => {
    setSelectedMatch(null);
  };
  
  const handleAddScorer = () => {
    if (!selectedPlayer || !selectedMatch) return;
    
    const player = getPlayerById(selectedPlayer);
    if (!player) return;
    
    const existingScorer = scorers.find(s => s.playerId === selectedPlayer);
    
    if (existingScorer) {
      setScorers(prev => 
        prev.map(s => 
          s.playerId === selectedPlayer 
            ? { ...s, count: s.count + goalCount }
            : s
        )
      );
    } else {
      setScorers(prev => [
        ...prev,
        {
          playerId: selectedPlayer,
          teamId: player.teamId || '',
          count: goalCount
        }
      ]);
    }
    
    setSelectedPlayer(null);
    setGoalCount(1);
  };
  
  const handleRemoveScorer = (index: number) => {
    setScorers(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSaveResult = () => {
    if (!selectedMatch) return;
    
    const homeGoals = scorers
      .filter(s => s.teamId === selectedMatch.homeTeamId)
      .reduce((total, scorer) => total + scorer.count, 0);
    
    const awayGoals = scorers
      .filter(s => s.teamId === selectedMatch.awayTeamId)
      .reduce((total, scorer) => total + scorer.count, 0);
    
    if (homeGoals !== resultForm.homeScore) {
      setError(`Os gols marcados pelos jogadores do time da casa (${homeGoals}) não correspondem ao placar (${resultForm.homeScore})`);
      return;
    }
    
    if (awayGoals !== resultForm.awayScore) {
      setError(`Os gols marcados pelos jogadores do time visitante (${awayGoals}) não correspondem ao placar (${resultForm.awayScore})`);
      return;
    }
    
    try {
      updateMatchResult(
        selectedMatch.id,
        resultForm.homeScore,
        resultForm.awayScore,
        scorers
      );
      
      if (selectedMatch.stage === 'semifinal') {
        const allSemifinalsPlayed = matches
          .filter(m => m.stage === 'semifinal')
          .every(m => m.played);
          
        if (allSemifinalsPlayed) {
          updateFinalTeams();
        }
      }
      
      setSuccess('Resultado salvo com sucesso');
      setSelectedMatch(null);
    } catch (err) {
      setError('Erro ao salvar o resultado');
    }
  };
  
  const getStageName = (match: Match) => {
    switch (match.stage) {
      case 'group':
        return `Fase de Grupos - Rodada ${match.matchDay}`;
      case 'semifinal':
        return 'Semifinal';
      case 'final':
        return 'Final';
      default:
        return 'Jogo';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Gerenciar Jogos</h2>
        
        {championship?.scheduleType === 'manual' && championship.status === 'setup' && (
          <button 
            onClick={() => setIsAddingMatch(true)} 
            className="btn btn-primary flex items-center"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Jogo
          </button>
        )}
      </div>
      
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

      {/* Add Match Form */}
      {isAddingMatch && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Adicionar Novo Jogo</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Time da Casa</label>
              <select
                className="input w-full"
                value={newMatch.homeTeamId}
                onChange={(e) => setNewMatch(prev => ({ ...prev, homeTeamId: e.target.value }))}
              >
                <option value="">Selecione o time da casa</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time Visitante</label>
              <select
                className="input w-full"
                value={newMatch.awayTeamId}
                onChange={(e) => setNewMatch(prev => ({ ...prev, awayTeamId: e.target.value }))}
              >
                <option value="">Selecione o time visitante</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data do Jogo</label>
              <input
                type="date"
                className="input w-full"
                value={newMatch.date}
                onChange={(e) => setNewMatch(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rodada</label>
              <input
                type="number"
                min="1"
                className="input w-full"
                value={newMatch.matchDay}
                onChange={(e) => setNewMatch(prev => ({ ...prev, matchDay: parseInt(e.target.value) }))}
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleAddMatch}
                className="btn btn-primary flex-1"
              >
                Adicionar Jogo
              </button>
              <button 
                onClick={() => setIsAddingMatch(false)}
                className="btn btn-outline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {selectedMatch ? (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {getStageName(selectedMatch)}
            </h3>
            <button 
              onClick={handleCloseMatchForm} 
              className="text-gray-500 hover:text-gray-700"
            >
              Fechar
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="text-right flex-1">
                <p className="font-semibold">{getTeamById(selectedMatch.homeTeamId)?.name}</p>
              </div>
              <div className="mx-4 text-center">
                <span className="text-lg">vs</span>
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold">{getTeamById(selectedMatch.awayTeamId)?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center mb-6">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  className="input w-20 text-center text-xl font-bold"
                  value={resultForm.homeScore}
                  onChange={(e) => setResultForm(prev => ({ ...prev, homeScore: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="mx-4">
                <span className="text-lg">-</span>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  className="input w-20 text-center text-xl font-bold"
                  value={resultForm.awayScore}
                  onChange={(e) => setResultForm(prev => ({ ...prev, awayScore: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-semibold mb-2 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Gols Marcados
            </h4>
            
            <div className="bg-white p-4 rounded-lg mb-4">
              {scorers.length > 0 ? (
                <ul className="space-y-2">
                  {scorers.map((scorer, index) => {
                    const player = getPlayerById(scorer.playerId);
                    const team = getTeamById(scorer.teamId);
                    
                    return (
                      <li key={index} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{player?.name}</span>
                          <span className="text-gray-500 text-sm ml-2">({team?.name})</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-3">{scorer.count} {scorer.count === 1 ? 'gol' : 'gols'}</span>
                          <button
                            onClick={() => handleRemoveScorer(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-2">
                  Nenhum gol marcado ainda
                </p>
              )}
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <h5 className="font-medium mb-2">Adicionar Gol</h5>
              
              <div className="mb-2">
                <label className="block text-sm mb-1">Jogador</label>
                <select
                  className="input w-full"
                  value={selectedPlayer || ''}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                >
                  <option value="">Selecione um jogador</option>
                  <optgroup label={getTeamById(selectedMatch.homeTeamId)?.name || 'Time da Casa'}>
                    {getTeamPlayers(selectedMatch.homeTeamId).map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={getTeamById(selectedMatch.awayTeamId)?.name || 'Time Visitante'}>
                    {getTeamPlayers(selectedMatch.awayTeamId).map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm mb-1">Número de Gols</label>
                <input
                  type="number"
                  min="1"
                  className="input w-full"
                  value={goalCount}
                  onChange={(e) => setGoalCount(parseInt(e.target.value) || 1)}
                />
              </div>
              
              <button
                onClick={handleAddScorer}
                disabled={!selectedPlayer}
                className="btn btn-secondary w-full"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Adicionar Gol
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleSaveResult}
            className="btn btn-primary w-full"
          >
            Salvar Resultado
          </button>
        </div>
      ) : (
        <>
          {championship?.status === 'setup' ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    O campeonato ainda não foi iniciado. Inicie o campeonato no Dashboard para gerar os jogos.
                  </p>
                </div>
              </div>
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Nenhum jogo encontrado. Inicie o campeonato para gerar os jogos.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          
          {groupMatches.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Fase de Grupos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupMatches.map(match => {
                  const homeTeam = getTeamById(match.homeTeamId);
                  const awayTeam = getTeamById(match.awayTeamId);
                  const matchDate = new Date(match.date);
                  
                  return (
                    <div 
                      key={match.id} 
                      className={`card cursor-pointer transition-all hover:shadow-lg ${match.played ? 'bg-gray-50' : 'bg-white'}`}
                      onClick={() => handleSelectMatch(match)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium">
                            Rodada {match.matchDay}
                          </span>
                          {match.played ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Finalizado
                            </span>
                          ) : (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Pendente
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-right flex-1">
                            <p className="font-semibold">{homeTeam?.name}</p>
                          </div>
                          <div className="mx-4 text-center">
                            {match.played ? (
                              <div className="flex items-center">
                                <span className="text-xl font-bold">{match.homeScore}</span>
                                <span className="mx-1">-</span>
                                <span className="text-xl font-bold">{match.awayScore}</span>
                              </div>
                            ) : (
                              <span className="text-sm font-medium px-2 py-1 rounded bg-gray-100">
                                vs
                              </span>
                            )}
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold">{awayTeam?.name}</p>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{matchDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {semifinalMatches.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Semifinais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {semifinalMatches.map(match => {
                  const homeTeam = getTeamById(match.homeTeamId);
                  const awayTeam = getTeamById(match.awayTeamId);
                  const matchDate = new Date(match.date);
                  
                  return (
                    <div 
                      key={match.id} 
                      className={`card cursor-pointer transition-all hover:shadow-lg ${match.played ? 'bg-gray-50' : 'bg-white'}`}
                      onClick={() => handleSelectMatch(match)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium bg-secondary text-primary px-2 py-1 rounded">
                            Semifinal
                          </span>
                          {match.played ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Finalizado
                            </span>
                          ) : (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Pendente
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-right flex-1">
                            <p className="font-semibold">{homeTeam?.name}</p>
                          </div>
                          <div className="mx-4 text-center">
                            {match.played ? (
                              <div className="flex items-center">
                                <span className="text-xl font-bold">{match.homeScore}</span>
                                <span className="mx-1">-</span>
                                <span className="text-xl font-bold">{match.awayScore}</span>
                              </div>
                            ) : (
                              <span className="text-sm font-medium px-2 py-1 rounded bg-gray-100">
                                vs
                              </span>
                            )}
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold">{awayTeam?.name}</p>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{matchDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {finalMatches.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Final</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {finalMatches.map(match => {
                  let homeTeamId = match.homeTeamId;
                  let awayTeamId = match.awayTeamId;
                  
                  if (homeTeamId === 'TBD' || awayTeamId === 'TBD') {
                    const playedSemis = semifinalMatches.filter(m => m.played);
                    
                    if (playedSemis.length === 2) {
                      const semi1Winner = playedSemis[0].homeScore !== null && playedSemis[0].awayScore !== null
                        ? playedSemis[0].homeScore > playedSemis[0].awayScore
                          ? playedSemis[0].homeTeamId
                          : playedSemis[0].awayTeamId
                        : 'TBD';
                        
                      const semi2Winner = playedSemis[1].homeScore !== null && playedSemis[1].awayScore !== null
                        ? playedSemis[1].homeScore > playedSemis[1].awayScore
                          ? playedSemis[1].homeTeamId
                          : playedSemis[1].awayTeamId
                        : 'TBD';
                        
                      homeTeamId = semi1Winner;
                      awayTeamId = semi2Winner;
                    }
                  }
                  
                  const homeTeam = typeof homeTeamId === 'string' && homeTeamId !== 'TBD' 
                    ? getTeamById(homeTeamId) 
                    : null;
                    
                  const awayTeam = typeof awayTeamId === 'string' && awayTeamId !== 'TBD'
                    ? getTeamById(awayTeamId)
                    : null;
                    
                  const matchDate = new Date(match.date);
                  
                  return (
                    <div 
                      key={match.id} 
                      className={`card cursor-pointer transition-all hover:shadow-lg ${match.played ? 'bg-gray-50' : 'bg-white'}`}
                      onClick={() => handleSelectMatch(match)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium bg-primary text-white px-2 py-1 rounded">
                            Final
                          </span>
                          {match.played ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Finalizado
                            </span>
                          ) : (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Pendente
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-right flex-1">
                            <p className="font-semibold">{homeTeam?.name || 'A confirmar'}</p>
                          </div>
                          <div className="mx-4 text-center">
                            {match.played ? (
                              <div className="flex items-center">
                                <span className="text-xl font-bold">{match.homeScore}</span>
                                <span className="mx-1">-</span>
                                <span className="text-xl font-bold">{match.awayScore}</span>
                              </div>
                            ) : (
                              <span className="text-sm font-medium px-2 py-1 rounded bg-gray-100">
                                vs
                              </span>
                            )}
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold">{awayTeam?.name || 'A confirmar'}</p>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{matchDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminMatches;