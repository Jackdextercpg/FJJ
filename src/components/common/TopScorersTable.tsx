import React from 'react';
import { Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Player } from '../../models/types';
import { useChampionship } from '../../contexts/ChampionshipContext';

interface TopScorersTableProps {
  players: Player[];
  showTitle?: boolean;
  limit?: number;
}

const TopScorersTable: React.FC<TopScorersTableProps> = ({ 
  players, 
  showTitle = true,
  limit = 10 
}) => {
  const { getTeamById } = useChampionship();
  const limitedPlayers = players.slice(0, limit);

  return (
    <div className="card overflow-x-auto">
      {showTitle && (
        <h3 className="p-4 font-bold text-lg border-b flex items-center">
          <Target className="w-5 h-5 mr-2 text-secondary" />
          Artilharia
        </h3>
      )}
      
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="table-header text-left">#</th>
            <th className="table-header text-left">Jogador</th>
            <th className="table-header text-left">Time</th>
            <th className="table-header text-center">Gols</th>
          </tr>
        </thead>
        <tbody>
          {limitedPlayers.map((player, index) => {
            const team = player.teamId ? getTeamById(player.teamId) : undefined;
            
            let rowClass = "table-row";
            
            // Highlight top scorer
            if (index === 0) {
              rowClass += " bg-yellow-50";
            }
            
            return (
              <tr key={player.id} className={rowClass}>
                <td className="table-cell font-semibold">{index + 1}</td>
                <td className="table-cell">
                  <Link to={`/player/${player.id}`} className="hover:text-primary">
                    <div className="flex items-center">
                      {player.imageUrl && (
                        <img 
                          src={player.imageUrl} 
                          alt={player.name} 
                          className="w-8 h-8 rounded-full object-cover mr-2"
                        />
                      )}
                      {player.name}
                    </div>
                  </Link>
                </td>
                <td className="table-cell">
                  <div className="flex items-center">
                    {team?.logoUrl && (
                      <img 
                        src={team.logoUrl} 
                        alt={team.name} 
                        className="w-4 h-4 mr-1"
                      />
                    )}
                    {team?.name || 'Sem time'}
                  </div>
                </td>
                <td className="table-cell text-center font-bold">{player.goals}</td>
              </tr>
            );
          })}
          
          {limitedPlayers.length === 0 && (
            <tr>
              <td colSpan={4} className="table-cell text-center py-4 text-gray-500">
                Nenhum gol registrado ainda
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TopScorersTable;