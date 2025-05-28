import React from 'react';
import { User, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Player } from '../../models/types';
import { useChampionship } from '../../contexts/ChampionshipContext';

interface PlayerCardProps {
  player: Player;
  showTeam?: boolean;
  showGoals?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  showTeam = true,
  showGoals = true,
  isSelectable = false,
  isSelected = false,
  onClick
}) => {
  const { getTeamById } = useChampionship();
  const team = player.teamId ? getTeamById(player.teamId) : undefined;

  const defaultImageUrl = "https://images.pexels.com/photos/3785927/pexels-photo-3785927.jpeg";
  const imageUrl = player.imageUrl || defaultImageUrl;

  return (
    <div 
      className={`card flex transition-all duration-300 hover:shadow-lg ${isSelectable ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <div className="w-24 h-24 bg-gray-200 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={player.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <User className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="p-3 flex-grow">
        <Link to={`/player/${player.id}`} className="hover:text-primary">
          <h3 className="font-semibold">{player.name}</h3>
        </Link>
        
        {showTeam && team && (
          <div className="flex items-center mt-1">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="w-4 h-4 mr-1" />
            ) : null}
            <p className="text-sm text-gray-600">{team.name}</p>
          </div>
        )}
        
        {showGoals && player.goals > 0 && (
          <div className="mt-1 flex items-center text-sm font-medium">
            <Target className="w-4 h-4 mr-1 text-secondary" />
            <span>
              {player.goals} {player.goals === 1 ? 'gol' : 'gols'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;