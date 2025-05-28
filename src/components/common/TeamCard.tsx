import React from 'react';
import { Shield, Coins as Coin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Team } from '../../models/types';
import { useChampionship } from '../../contexts/ChampionshipContext';

interface TeamCardProps {
  team: Team;
  showBalance?: boolean;
  showPlayerCount?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ 
  team, 
  showBalance = true, 
  showPlayerCount = true,
  isActive = false,
  onClick
}) => {
  const { getTeamPlayers } = useChampionship();
  const players = getTeamPlayers(team.id);

  const defaultBgUrl = "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg";
  const backgroundUrl = team.backgroundUrl || defaultBgUrl;

  return (
    <div 
      className={`card transition-all duration-300 hover:shadow-lg ${isActive ? 'ring-4 ring-primary' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div 
        className="h-32 bg-cover bg-center" 
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      >
        <div className="h-full w-full bg-black bg-opacity-50 flex items-center justify-center p-4">
          <h3 className="text-xl font-bold text-white text-center">{team.name}</h3>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-primary mr-2" />
            <span className="font-semibold">{team.name}</span>
          </div>
          
          {showBalance && (
            <div className="flex items-center text-secondary font-semibold">
              <Coin className="w-4 h-4 mr-1" />
              <span>{team.fjjdotyBalance.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        {showPlayerCount && (
          <div className="mt-2 text-sm text-gray-600">
            {players.length} jogadores no elenco
          </div>
        )}
        
        <div className="mt-3">
          <Link
            to={`/teams?id=${team.id}`}
            className="text-sm text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;