import React from 'react';
import { Calendar, Clock, Trophy } from 'lucide-react';
import { Match } from '../../models/types';
import { useChampionship } from '../../contexts/ChampionshipContext';

interface MatchCardProps {
  match: Match;
  showDate?: boolean;
  onClick?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  showDate = true,
  onClick
}) => {
  const { getTeamById, getPlayerById } = useChampionship();
  
  const homeTeam = getTeamById(match.homeTeamId);
  const awayTeam = getTeamById(match.awayTeamId);
  
  if (!homeTeam || !awayTeam) {
    return null;
  }

  const matchDate = new Date(match.date);
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(matchDate);
  
  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(matchDate);

  const getStageBadge = () => {
    switch (match.stage) {
      case 'group':
        return <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">Fase de Grupos</span>;
      case 'semifinal':
        return <span className="bg-secondary text-primary text-xs px-2 py-1 rounded">Semifinal</span>;
      case 'final':
        return <span className="bg-primary text-white text-xs px-2 py-1 rounded">Final</span>;
      default:
        return null;
    }
  };

  return (
    <div 
      className="card transition-all duration-300 hover:shadow-lg"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          {getStageBadge()}
          
          {match.played ? (
            <span className="text-xs font-medium text-primary">Finalizado</span>
          ) : (
            <span className="text-xs font-medium text-gray-500">Não realizado</span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-right flex-1">
            <p className="font-semibold">{homeTeam.name}</p>
          </div>
          
          <div className="mx-4 text-center">
            {match.played ? (
              <div className="flex items-center justify-center">
                <span className="text-2xl font-bold">{match.homeScore}</span>
                <span className="mx-2">-</span>
                <span className="text-2xl font-bold">{match.awayScore}</span>
              </div>
            ) : (
              <span className="text-sm font-medium px-2 py-1 rounded bg-gray-100">vs</span>
            )}
          </div>
          
          <div className="text-left flex-1">
            <p className="font-semibold">{awayTeam.name}</p>
          </div>
        </div>
        
        {match.played && match.scorers && match.scorers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
            <p className="font-semibold">Gols:</p>
            <ul className="mt-1">
              {match.scorers.map((scorer, index) => {
                const player = getPlayerById(scorer.playerId);
                const team = getTeamById(scorer.teamId);
                return (
                  <li key={index} className="flex items-center">
                    <Trophy className="w-3 h-3 mr-1 text-secondary" />
                    <span>{player?.name} ({team?.name}) - {scorer.count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {showDate && (
          <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600 flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>{formattedTime}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchCard;