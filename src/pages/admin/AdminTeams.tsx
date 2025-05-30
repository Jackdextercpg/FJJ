import React, { useState } from 'react';
import { PlusCircle, Trash2, Edit, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useChampionship } from '../../contexts/ChampionshipContext';
import { Team } from '../../models/types';
import FileUpload from '../../components/common/FileUpload';

const AdminTeams: React.FC = () => {
  const { 
    teams, 
    addTeam, 
    updateTeam, 
    deleteTeam, 
    championship,
    updateChampionship,
    getTeamPlayers
  } = useChampionship();
  
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    logoFile: null as File | null,
    backgroundFile: null as File | null,
    logoUrl: '',
    backgroundUrl: ''
  });

  const handleFileUpload = async (file: File, type: 'logo' | 'background') => {
    try {
      // Here you would typically upload the file to your storage service
      // For now, we'll use a local URL
      const url = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        [`${type}File`]: file,
        [`${type}Url`]: url
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Erro ao fazer upload do arquivo');
    }
  };
  
  const handleOpenAddForm = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormData({
      name: '',
      logoFile: null,
      backgroundFile: null,
      logoUrl: '',
      backgroundUrl: ''
    });
    setError(null);
    setSuccess(null);
  };
  
  const handleOpenEditForm = (team: Team) => {
    setIsAdding(false);
    setIsEditing(team.id);
    setFormData({
      name: team.name,
      logoFile: null,
      backgroundFile: null,
      logoUrl: team.logoUrl || '',
      backgroundUrl: team.backgroundUrl || ''
    });
    setError(null);
    setSuccess(null);
  };
  
  const handleCloseForm = () => {
    setIsAdding(false);
    setIsEditing(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!formData.name) {
      setError('O nome do time é obrigatório');
      return;
    }
    
    try {
      if (isAdding) {
        // Add new team
        const newTeam = addTeam({
          name: formData.name,
          logoUrl: formData.logoUrl,
          backgroundUrl: formData.backgroundUrl
        });
        
        if (championship && championship.status === 'setup') {
          updateChampionship({
            ...championship,
            teams: [...championship.teams, newTeam.id]
          });
        }
        
        setSuccess(`Time "${formData.name}" adicionado com sucesso`);
        setFormData({
          name: '',
          logoFile: null,
          backgroundFile: null,
          logoUrl: '',
          backgroundUrl: ''
        });
        setIsAdding(false);
      } else if (isEditing) {
        // Update existing team
        const team = teams.find(t => t.id === isEditing);
        if (!team) return;
        
        updateTeam({
          ...team,
          name: formData.name,
          logoUrl: formData.logoUrl || team.logoUrl,
          backgroundUrl: formData.backgroundUrl || team.backgroundUrl
        });
        
        setSuccess(`Time "${formData.name}" atualizado com sucesso`);
        setIsEditing(null);
      }
    } catch (err) {
      setError('Erro ao salvar o time');
    }
  };
  
  const handleDelete = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    
    const players = getTeamPlayers(teamId);
    
    if (players.length > 0) {
      setError(`Não é possível excluir o time "${team.name}" pois ele possui jogadores cadastrados`);
      return;
    }
    
    if (championship && championship.status !== 'setup') {
      setError(`Não é possível excluir times durante o campeonato`);
      return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o time "${team.name}"?`)) {
      try {
        deleteTeam(teamId);
        
        // Remove team from championship if active
        if (championship && championship.teams.includes(teamId)) {
          updateChampionship({
            ...championship,
            teams: championship.teams.filter(id => id !== teamId)
          });
        }
        
        setSuccess(`Time "${team.name}" excluído com sucesso`);
      } catch (err) {
        setError('Erro ao excluir o time');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Gerenciar Times</h2>
        
        {!isAdding && !isEditing && (
          <button 
            onClick={handleOpenAddForm} 
            className="btn btn-primary flex items-center"
            disabled={championship && championship.status !== 'setup'}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Time
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
            {isAdding ? 'Adicionar Novo Time' : 'Editar Time'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nome do Time</label>
              <input
                type="text"
                className="input w-full"
                placeholder="Nome do time"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Logo do Time</label>
              <FileUpload
                onFileSelect={(file) => handleFileUpload(file, 'logo')}
                previewUrl={formData.logoUrl}
                onClear={() => setFormData(prev => ({ ...prev, logoUrl: '', logoFile: null }))}
                label="Upload da Logo"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Imagem de Fundo</label>
              <FileUpload
                onFileSelect={(file) => handleFileUpload(file, 'background')}
                previewUrl={formData.backgroundUrl}
                onClear={() => setFormData(prev => ({ ...prev, backgroundUrl: '', backgroundFile: null }))}
                label="Upload da Imagem de Fundo"
              />
            </div>
            
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary flex-1">
                {isAdding ? 'Adicionar Time' : 'Salvar Alterações'}
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
      
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <div key={team.id} className="card">
              <div 
                className="h-32 bg-cover bg-center" 
                style={{ backgroundImage: `url(${team.backgroundUrl || "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg"})` }}
              >
                <div className="h-full w-full bg-black bg-opacity-50 flex items-center justify-center p-4">
                  <h3 className="text-xl font-bold text-white text-center">{team.name}</h3>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-primary mr-2" />
                    <span className="text-sm">{getTeamPlayers(team.id).length} jogadores</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-secondary font-semibold">{team.fjjdotyBalance} FJJDOTY</span>
                  </div>
                </div>
                
                <div className="flex mt-2 gap-2">
                  <button 
                    onClick={() => handleOpenEditForm(team)} 
                    className="btn btn-outline flex-1 text-sm"
                    disabled={championship && championship.status !== 'setup'}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(team.id)} 
                    className="btn btn-outline text-red-500 hover:bg-red-50 flex items-center justify-center px-3"
                    disabled={championship && championship.status !== 'setup'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-xl font-semibold mb-2">Nenhum time cadastrado</h3>
          <p className="text-gray-500 mb-4">
            Clique no botão "Adicionar Time" para começar
          </p>
          <button onClick={handleOpenAddForm} className="btn btn-primary">
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Time
          </button>
        </div>
      )}
      
      {championship && championship.status !== 'setup' && (
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Não é possível adicionar, editar ou remover times durante o campeonato.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeams;