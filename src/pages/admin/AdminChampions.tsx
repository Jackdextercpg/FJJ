import React, { useState } from 'react';
import { Trophy, PlusCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useChampionship } from '../../contexts/ChampionshipContext';

const AdminChampions: React.FC = () => {
  const { 
    pastChampions, 
    teams, 
    players,
    addChampionshipHistory,
    getTeamById,
    getPlayerById
  } = useChampionship();
  
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    season: new Date().getFullYear().toString(),
    championId: '',
    topScorerId: '',
    finalHighlights: ''
  });
  
  const handleOpenAddForm = () => {
    setIsAdding(true);
    setFormData({
      season: new Date().getFullYear().toString(),
      championId: teams.length > 0 ? teams[0].id : '',
      topScorerId: players.length > 0 ? players[0].id : '',
      finalHighlights: ''
    });
    setError(null);
    setSuccess(null);
  };
  
  const handleCloseForm = () => {
    setIsAdding(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!formData.season || !formData.championId || !formData.topScorerId || !formData.finalHighlights) {
      setError('Preencha todos os campos');
      return;
    }
    
    try {
      addChampionshipHistory(formData);
      setSuccess('Campeão adicionado com sucesso');
      setIsAdding(false);
    } catch (err) {
      setError('Erro ao adicionar o campeão');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Campeões de Edições Passadas</h2>
        
        {!isAdding && (
          <button 
            onClick={handleOpenAddForm} 
            className="btn btn-primary flex items-center"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Campeão
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
      
      {isAdding && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">
            Adicionar Campeão de Edição Anterior
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Temporada</label>
              <input
                type="text"
                className="input w-full"
                placeholder="2023"
                value={formData.season}
                onChange={(e) => setFormData(prev => ({ ...prev, season: e.target.value }))}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Time Campeão</label>
              <select
                className="input w-full"
                value={formData.championId}
                onChange={(e) => setFormData(prev => ({ ...prev, championId: e.target.value }))}
                required
              >
                <option value="">Selecione o campeão</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Artilheiro</label>
              <select
                className="input w-full"
                value={formData.topScorerId}
                onChange={(e) => setFormData(prev => ({ ...prev, topScorerId: e.target.value }))}
                required
              >
                <option value="">Selecione o artilheiro</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.name} {player.teamId ? `(${getTeamById(player.teamId)?.name})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Destaques da Final</label>
              <textarea
                className="input w-full min-h-[100px]"
                placeholder="Descreva os destaques da final..."
                value={formData.finalHighlights}
                onChange={(e) => setFormData(prev => ({ ...prev, finalHighlights: e.target.value }))}
                required
              />
            </div>
            
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary flex-1">
                Adicionar Campeão
              </button>
              <button 
                type="button" 
                onClick={handleCloseForm} 
                className="btn btn-outline"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      
      {pastChampions.length > 0 ? (
        <div className="space-y-4">
          {[...pastChampions]
            .sort((a, b) => b.season.localeCompare(a.season))
            .map(champion => {
              const team = getTeamById(champion.championId);
              const topScorer = getPlayerById(champion.topScorerId);
              
              return (
                <div key={champion.id} className="card p-4">
                  <div className="flex items-center mb-3">
                    <Trophy className="w-5 h-5 text-secondary mr-2" />
                    <h3 className="font-bold">Temporada {champion.season}</h3>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm">
                      <span className="font-medium">Campeão:</span> {team?.name || 'Desconhecido'}
                    </p>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm">
                      <span className="font-medium">Artilheiro:</span> {topScorer?.name || 'Desconhecido'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Destaques:</span> {champion.finalHighlights}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-xl font-semibold mb-2">Nenhum campeão registrado</h3>
          <p className="text-gray-500 mb-4">
            Registre os campeões de edições anteriores do campeonato
          </p>
          <button onClick={handleOpenAddForm} className="btn btn-primary">
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Campeão
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminChampions;