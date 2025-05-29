import React, { useState } from 'react';
import { PlusCircle, Trash2, Edit, User, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useChampionship } from '../../contexts/ChampionshipContext';
import { Player } from '../../models/types';
import PlayerCard from '../../components/common/PlayerCard';
import FileUpload from '../../components/common/FileUpload';

const AdminPlayers: React.FC = () => {
  const { 
    teams, 
    players, 
    addPlayer, 
    updatePlayer, 
    deletePlayer,
    getTeamById
  } = useChampionship();

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    imageFile: null as File | null,
    imageUrl: '',
    teamId: ''
  });

  const handleOpenAddForm = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormData({
      name: '',
      imageFile: null,
      imageUrl: '',
      teamId: selectedTeam || ''
    });
    setError(null);
    setSuccess(null);
  };

  const handleOpenEditForm = (player: Player) => {
    setIsAdding(false);
    setIsEditing(player.id);
    setFormData({
      name: player.name,
      imageFile: null,
      imageUrl: player.imageUrl || '',
      teamId: player.teamId || ''
    });
    setError(null);
    setSuccess(null);
  };

  const handleCloseForm = () => {
    setIsAdding(false);
    setIsEditing(null);
  };

  const handleFileUpload = async (file: File) => {
    try {
      // Here you would typically upload the file to your storage service
      // For now, we'll use a local URL
      const url = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imageUrl: url
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Erro ao fazer upload do arquivo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name) {
      setError('O nome do jogador é obrigatório');
      return;
    }

    try {
      if (isAdding) {
        // Add new player
        addPlayer({
          name: formData.name,
          imageUrl: formData.imageUrl,
          teamId: formData.teamId || null
        });

        setSuccess(`Jogador "${formData.name}" adicionado com sucesso`);
        setFormData({
          name: '',
          imageFile: null,
          imageUrl: '',
          teamId: selectedTeam || ''
        });
      } else if (isEditing) {
        // Update existing player
        const player = players.find(p => p.id === isEditing);
        if (!player) return;

        updatePlayer({
          ...player,
          name: formData.name,
          imageUrl: formData.imageUrl || player.imageUrl,
          teamId: formData.teamId || null
        });

        setSuccess(`Jogador "${formData.name}" atualizado com sucesso`);
        setIsEditing(null);
      }
    } catch (err) {
      setError('Erro ao salvar o jogador');
    }
  };

  const handleDelete = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    if (confirm(`Tem certeza que deseja excluir o jogador "${player.name}"?`)) {
      try {
        deletePlayer(playerId);
        setSuccess(`Jogador "${player.name}" excluído com sucesso`);
      } catch (err) {
        setError('Erro ao excluir o jogador');
      }
    }
  };

  // Filter players by team
  const filteredPlayers = selectedTeam 
    ? players.filter(player => player.teamId === selectedTeam)
    : players;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Gerenciar Jogadores</h2>

        {!isAdding && !isEditing && (
          <button 
            onClick={handleOpenAddForm} 
            className="btn btn-primary flex items-center"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Jogador
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

      {(isAdding || isEditing) && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {isAdding ? 'Adicionar Novo Jogador' : 'Editar Jogador'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nome do Jogador</label>
              <input
                type="text"
                className="input w-full"
                placeholder="Nome do jogador"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Foto do Jogador</label>
              <FileUpload 
                    onFileSelect={(file, publicUrl) => {
                      setSelectedFile(file);
                      setUploadedPhotoUrl(publicUrl || null);
                    }}
                    onClear={() => {
                      setSelectedFile(null);
                      setUploadedPhotoUrl(null);
                    }}
                    label="Foto do jogador"
                    bucket="players"
                  />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Time</label>
              <select
                className="input w-full"
                value={formData.teamId}
                onChange={(e) => setFormData(prev => ({ ...prev, teamId: e.target.value }))}
              >
                <option value="">Sem time</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary flex-1">
                {isAdding ? 'Adicionar Jogador' : 'Salvar Alterações'}
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

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Filtrar por time</label>
        <select
          className="input w-full"
          value={selectedTeam || ''}
          onChange={(e) => setSelectedTeam(e.target.value || null)}
        >
          <option value="">Todos os times</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlayers.map(player => {
            const team = player.teamId ? getTeamById(player.teamId) : undefined;

            return (
              <div key={player.id} className="card flex">
                <div className="w-24 h-full bg-gray-200">
                  {player.imageUrl ? (
                    <img 
                      src={player.imageUrl} 
                      alt={player.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold">{player.name}</h3>
                    <p className="text-sm text-gray-600">
                      {team ? team.name : 'Sem time'}
                    </p>
                    {player.goals > 0 && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">{player.goals}</span> gols
                      </p>
                    )}
                  </div>

                  <div className="flex mt-2 gap-2">
                    <button 
                      onClick={() => handleOpenEditForm(player)} 
                      className="btn btn-outline flex-1 text-sm"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(player.id)} 
                      className="btn btn-outline text-red-500 hover:bg-red-50 flex items-center justify-center px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-xl font-semibold mb-2">
            {selectedTeam ? 'Este time não tem jogadores' : 'Nenhum jogador cadastrado'}
          </h3>
          <p className="text-gray-500 mb-4">
            {selectedTeam ? 'Adicione jogadores a este time' : 'Clique no botão "Adicionar Jogador" para começar'}
          </p>
          <button onClick={handleOpenAddForm} className="btn btn-primary">
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Jogador
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPlayers;