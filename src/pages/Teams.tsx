import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, User, Briefcase, Coins as Coin, ArrowRight, ArrowLeft } from 'lucide-react';
import { useChampionship } from '../contexts/ChampionshipContext';
import TeamCard from '../components/common/TeamCard';
import PlayerCard from '../components/common/PlayerCard';

const Teams: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTeamId = searchParams.get('id');
  
  const { 
    teams, 
    getTeamById, 
    getTeamPlayers, 
    getTeamMatches, 
    getTeamTransfers 
  } = useChampionship();

  const [selectedTeam, setSelectedTeam] = useState<string | null>(selectedTeamId);

  useEffect(() => {
    if (selectedTeamId) {
      setSelectedTeam(selectedTeamId);
    }
  }, [selectedTeamId]);

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId);
    setSearchParams({ id: teamId });
  };

  const handleBackToList = () => {
    setSelectedTeam(null);
    setSearchParams({});
  };

  // Team detail view
  if (selectedTeam) {
    const team = getTeamById(selectedTeam);
    if (!team) return null;

    const players = getTeamPlayers(team.id);
    const matches = getTeamMatches(team.id).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const transfers = getTeamTransfers(team.id).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const playedMatches = matches.filter(match => match.played);
    const upcomingMatches = matches.filter(match => !match.played);

    // Calculate team stats
    const wins = playedMatches.filter(match => {
      if (match.homeTeamId === team.id) return match.homeScore !== null && match.awayScore !== null && match.homeScore > match.awayScore;
      return match.homeScore !== null && match.awayScore !== null && match.awayScore > match.homeScore;
    }).length;

    const draws = playedMatches.filter(match => 
      match.homeScore !== null && match.awayScore !== null && match.homeScore === match.awayScore
    ).length;

    const losses = playedMatches.length - wins - draws;

    return (
      <div>
        <button 
          onClick={handleBackToList} 
          className="flex items-center text-primary mb-4 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para lista de times
        </button>

        <div 
          className="h-48 bg-cover bg-center rounded-lg mb-6" 
          style={{ 
            backgroundImage: `url(${team.backgroundUrl || "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg"})` 
          }}
        >
          <div className="h-full w-full bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
            <h1 className="text-3xl font-bold text-white">{team.name}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card p-4 flex items-center justify-center bg-primary/5">
            <Briefcase className="w-6 h-6 mr-3 text-primary" />
            <div>
              <p className="text-sm text-gray-600">Saldo</p>
              <p className="text-xl font-bold text-primary">
                {team.fjjdotyBalance.toLocaleString()} FJJDOTY
              </p>
            </div>
          </div>

          <div className="card p-4 flex items-center justify-center bg-primary/5">
            <Users className="w-6 h-6 mr-3 text-primary" />
            <div>
              <p className="text-sm text-gray-600">Jogadores</p>
              <p className="text-xl font-bold">{players.length}</p>
            </div>
          </div>

          <div className="card p-4 flex items-center justify-center bg-primary/5">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Desempenho</p>
              <div className="flex items-center justify-center space-x-3">
                <div>
                  <p className="text-xs text-green-600">V</p>
                  <p className="font-semibold">{wins}</p>
                </div>
                <div>
                  <p className="text-xs text-yellow-600">E</p>
                  <p className="font-semibold">{draws}</p>
                </div>
                <div>
                  <p className="text-xs text-red-600">D</p>
                  <p className="font-semibold">{losses}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Elenco
          </h2>

          {players.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {players.map(player => (
                <PlayerCard 
                  key={player.id} 
                  player={player} 
                  showTeam={false}
                />
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-gray-500">Este time ainda não tem jogadores</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            Transferências Recentes
          </h2>

          {transfers.length > 0 ? (
            <div className="card overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="table-header text-left">Data</th>
                    <th className="table-header text-left">Jogador</th>
                    <th className="table-header text-left">De</th>
                    <th className="table-header text-left">Para</th>
                    <th className="table-header text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.slice(0, 5).map(transfer => {
                    const player = getTeamById(transfer.playerId);
                    const fromTeam = transfer.fromTeamId ? getTeamById(transfer.fromTeamId) : null;
                    const toTeam = getTeamById(transfer.toTeamId);
                    
                    const date = new Date(transfer.date).toLocaleDateString('pt-BR');
                    
                    return (
                      <tr key={transfer.id} className="table-row">
                        <td className="table-cell">{date}</td>
                        <td className="table-cell">{player?.name || 'Desconhecido'}</td>
                        <td className="table-cell">{fromTeam?.name || 'Novo Jogador'}</td>
                        <td className="table-cell">{toTeam?.name || 'Desconhecido'}</td>
                        <td className="table-cell text-right">
                          <span className="font-semibold text-secondary">
                            {transfer.amount.toLocaleString()} FJJDOTY
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-gray-500">Nenhuma transferência realizada ainda</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Teams list view
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Users className="mr-2 text-primary" />
        Times Participantes
      </h1>

      {teams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              onClick={() => handleTeamSelect(team.id)}
            />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-xl font-semibold mb-2">Nenhum time cadastrado</h3>
          <p className="text-gray-500 mb-4">
            Cadastre times no painel administrativo para começar.
          </p>
          <a href="/admin/teams" className="btn btn-primary inline-flex items-center">
            Ir para o painel admin
            <ArrowRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};

export default Teams;