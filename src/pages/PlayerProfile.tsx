import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Star, ArrowLeft, Medal, Clock, Shield } from 'lucide-react';
import { useChampionship } from '../contexts/ChampionshipContext';

const PlayerProfile: React.FC = () => {
  const { id } = useParams();
  const { 
    getPlayerById, 
    getTeamById, 
    transfers, 
    pastChampions,
    matches 
  } = useChampionship();

  const player = id ? getPlayerById(id) : null;
  if (!player) return null;

  const currentTeam = player.teamId ? getTeamById(player.teamId) : null;

  // Get player's transfer history
  const playerTransfers = transfers
    .filter(t => t.playerId === player.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate achievements
  const championships = pastChampions.filter(c => c.championId === player.teamId);
  const topScorer = pastChampions.filter(c => c.topScorerId === player.id);

  // Calculate match statistics
  const playerMatches = matches.filter(match => {
    const scorers = match.scorers || [];
    return scorers.some(scorer => scorer.playerId === player.id);
  });

  const totalGoals = playerMatches.reduce((total, match) => {
    const playerScorer = match.scorers?.find(s => s.playerId === player.id);
    return total + (playerScorer?.count || 0);
  }, 0);

  const goalsPerMatch = playerMatches.length > 0 
    ? (totalGoals / playerMatches.length).toFixed(2)
    : '0';

  return (
    <div>
      <Link 
        to="/teams" 
        className="flex items-center text-primary mb-4 hover:underline"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para times
      </Link>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-64 h-64">
            {player.imageUrl ? (
              <img 
                src={player.imageUrl} 
                alt={player.name} 
                className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-t-none">
                <Shield className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="p-6 flex-grow">
            <h1 className="text-2xl font-bold mb-2">{player.name}</h1>
            
            <div className="flex items-center mb-4">
              {currentTeam && (
                <div className="flex items-center">
                  {currentTeam.logoUrl ? (
                    <img 
                      src={currentTeam.logoUrl} 
                      alt={currentTeam.name} 
                      className="w-6 h-6 mr-2"
                    />
                  ) : (
                    <Shield className="w-6 h-6 mr-2 text-gray-400" />
                  )}
                  <span className="font-medium">{currentTeam.name}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-gray-600">Gols</p>
                <p className="text-xl font-bold">{player.goals}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Star className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-gray-600">Média por Jogo</p>
                <p className="text-xl font-bold">{goalsPerMatch}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Medal className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-gray-600">Partidas</p>
                <p className="text-xl font-bold">{playerMatches.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-primary" />
            Conquistas
          </h2>
          
          {championships.length > 0 || topScorer.length > 0 ? (
            <ul className="space-y-4">
              {championships.map((championship, index) => (
                <li key={index} className="flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-secondary" />
                  <span>Campeão Brasileiro - {championship.season}</span>
                </li>
              ))}
              {topScorer.map((achievement, index) => (
                <li key={`scorer-${index}`} className="flex items-center">
                  <Medal className="w-4 h-4 mr-2 text-secondary" />
                  <span>Artilheiro do Campeonato - {achievement.season}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhuma conquista registrada ainda
            </p>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            Histórico de Transferências
          </h2>
          
          {playerTransfers.length > 0 ? (
            <div className="space-y-4">
              {playerTransfers.map((transfer, index) => {
                const fromTeam = transfer.fromTeamId ? getTeamById(transfer.fromTeamId) : null;
                const toTeam = getTeamById(transfer.toTeamId);
                const date = new Date(transfer.date).toLocaleDateString('pt-BR');
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-4">
                        {fromTeam?.logoUrl ? (
                          <img src={fromTeam.logoUrl} alt={fromTeam.name} className="w-8 h-8" />
                        ) : (
                          <Shield className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 mx-2" />
                      <div>
                        {toTeam?.logoUrl ? (
                          <img src={toTeam.logoUrl} alt={toTeam.name} className="w-8 h-8" />
                        ) : (
                          <Shield className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {transfer.amount.toLocaleString()} FJJDOTY
                      </p>
                      <p className="text-xs text-gray-500">{date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhuma transferência registrada
            </p>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2 text-primary" />
          Desempenho em Partidas
        </h2>
        
        {playerMatches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="table-header text-left">Data</th>
                  <th className="table-header text-left">Partida</th>
                  <th className="table-header text-center">Gols</th>
                </tr>
              </thead>
              <tbody>
                {playerMatches.map((match, index) => {
                  const homeTeam = getTeamById(match.homeTeamId);
                  const awayTeam = getTeamById(match.awayTeamId);
                  const playerScorer = match.scorers?.find(s => s.playerId === player.id);
                  const date = new Date(match.date).toLocaleDateString('pt-BR');
                  
                  return (
                    <tr key={index} className="table-row">
                      <td className="table-cell">{date}</td>
                      <td className="table-cell">
                        <div className="flex items-center">
                          {homeTeam?.logoUrl ? (
                            <img src={homeTeam.logoUrl} alt={homeTeam.name} className="w-4 h-4 mr-1" />
                          ) : null}
                          {homeTeam?.name} 
                          <span className="mx-2">vs</span>
                          {awayTeam?.logoUrl ? (
                            <img src={awayTeam.logoUrl} alt={awayTeam.name} className="w-4 h-4 mr-1" />
                          ) : null}
                          {awayTeam?.name}
                        </div>
                      </td>
                      <td className="table-cell text-center font-medium">
                        {playerScorer?.count || 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Nenhuma partida registrada
          </p>
        )}
      </div>
    </div>
  );
};

export default PlayerProfile;