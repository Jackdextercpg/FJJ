import React from 'react';
import { TeamStanding } from '../../models/types';
import { useChampionship } from '../../contexts/ChampionshipContext';

interface StandingsTableProps {
  standings: TeamStanding[];
  showTitle?: boolean;
}

const StandingsTable: React.FC<StandingsTableProps> = ({ 
  standings, 
  showTitle = true 
}) => {
  const { getTeamById } = useChampionship();

  return (
    <div className="card overflow-x-auto">
      {showTitle && (
        <h3 className="p-4 font-bold text-lg border-b">Classificação</h3>
      )}
      
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="table-header text-left">#</th>
            <th className="table-header text-left">Time</th>
            <th className="table-header text-center">P</th>
            <th className="table-header text-center">J</th>
            <th className="table-header text-center">V</th>
            <th className="table-header text-center">E</th>
            <th className="table-header text-center">D</th>
            <th className="table-header text-center">GP</th>
            <th className="table-header text-center">GC</th>
            <th className="table-header text-center">SG</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing, index) => {
            const team = getTeamById(standing.teamId);
            let rowClass = "table-row";
            
            // Highlight top 4 teams (qualifying for knockout)
            if (index < 4) {
              rowClass += " border-l-4 border-green-500";
            }
            
            // Highlight bottom team (relegation)
            if (index === standings.length - 1 && standings.length > 1) {
              rowClass += " border-l-4 border-red-500";
            }
            
            return (
              <tr key={standing.teamId} className={rowClass}>
                <td className="table-cell font-semibold">{index + 1}</td>
                <td className="table-cell">
                  <div className="flex items-center">
                    {team?.logoUrl && (
                      <img 
                        src={team.logoUrl} 
                        alt={team.name} 
                        className="w-6 h-6 mr-2"
                      />
                    )}
                    {team?.name || 'Desconhecido'}
                  </div>
                </td>
                <td className="table-cell text-center font-bold">{standing.points}</td>
                <td className="table-cell text-center">{standing.played}</td>
                <td className="table-cell text-center">{standing.won}</td>
                <td className="table-cell text-center">{standing.drawn}</td>
                <td className="table-cell text-center">{standing.lost}</td>
                <td className="table-cell text-center">{standing.goalsFor}</td>
                <td className="table-cell text-center">{standing.goalsAgainst}</td>
                <td className="table-cell text-center">{standing.goalDifference}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StandingsTable;