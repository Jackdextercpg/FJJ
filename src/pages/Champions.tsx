import React from 'react';
import { Trophy, Star, Calendar, User } from 'lucide-react';
import { useChampionship } from '../contexts/ChampionshipContext';

const Champions: React.FC = () => {
  const { pastChampions, getTeamById, getPlayerById } = useChampionship();
  
  // Sort champions by most recent first
  const sortedChampions = [...pastChampions].sort((a, b) => 
    b.season.localeCompare(a.season)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Trophy className="mr-2 text-primary" />
        Campeões do FJJ Brasileirão
      </h1>

      {sortedChampions.length > 0 ? (
        <div className="space-y-8">
          {sortedChampions.map(champion => {
            const team = getTeamById(champion.championId);
            const topScorer = getPlayerById(champion.topScorerId);
            
            return (
              <div key={champion.id} className="card overflow-hidden">
                <div className="bg-primary p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Trophy className="w-6 h-6 mr-2 text-secondary" />
                      <h2 className="text-xl font-bold">Temporada {champion.season}</h2>
                    </div>
                    <div className="text-sm">
                      <span className="bg-white/20 px-2 py-1 rounded">
                        {new Date(champion.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-secondary" />
                        Time Campeão
                      </h3>
                      
                      {team ? (
                        <div 
                          className="card overflow-hidden shadow-md" 
                          style={{ 
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${team.backgroundUrl || "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg"})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <div className="p-6 text-white">
                            <h4 className="text-2xl font-bold">{team.name}</h4>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">Time não encontrado</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <User className="w-5 h-5 mr-2 text-secondary" />
                        Artilheiro
                      </h3>
                      
                      {topScorer ? (
                        <div className="card overflow-hidden shadow-md flex">
                          <div className="w-20 h-20 bg-gray-200">
                            {topScorer.imageUrl ? (
                              <img 
                                src={topScorer.imageUrl} 
                                alt={topScorer.name} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <User className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <h4 className="font-semibold">{topScorer.name}</h4>
                            <p className="text-sm text-gray-600">
                              {topScorer.goals} {topScorer.goals === 1 ? 'gol' : 'gols'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">Artilheiro não encontrado</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Destaques da Final</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{champion.finalHighlights}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-xl font-semibold">Nenhum campeão registrado</h3>
          <p className="text-gray-500 mt-2">
            Quando o campeonato for finalizado, o campeão aparecerá aqui
          </p>
        </div>
      )}
    </div>
  );
};

export default Champions;