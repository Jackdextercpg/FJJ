import React, { useState } from 'react';
import { CreditCard, PlusCircle, AlertTriangle, CheckCircle2, User } from 'lucide-react';
import { useChampionship } from '../../contexts/ChampionshipContext';
import PlayerCard from '../../components/common/PlayerCard';
import TeamCard from '../../components/common/TeamCard';

const AdminTransfers: React.FC = () => {
  const { 
    teams, 
    players, 
    transferPlayer, 
    getTeamById,
    getTeamPlayers
  } = useChampionship();
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Transfer form state
  const [transferType, setTransferType] = useState<'internal' | 'external'>('internal');
  const [fromTeam, setFromTeam] = useState<string>('');
  const [toTeam, setToTeam] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [newPlayerImage, setNewPlayerImage] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(
    transferType === 'internal' ? 100000 : 200000
  );
  
  // Reset form
  const resetForm = () => {
    setFromTeam('');
    setToTeam('');
    setSelectedPlayer('');
    setNewPlayerName('');
    setNewPlayerImage('');
    setTransferAmount(transferType === 'internal' ? 100000 : 200000);
  };
  
  // Handle transfer type change
  const handleTransferTypeChange = (type: 'internal' | 'external') => {
    setTransferType(type);
    resetForm();
    // Set default transfer amount based on type
    setTransferAmount(type === 'internal' ? 100000 : 200000);
  };
  
  // Handle from team change
  const handleFromTeamChange = (teamId: string) => {
    setFromTeam(teamId);
    setSelectedPlayer('');
  };
  
  // Handle to team change
  const handleToTeamChange = (teamId: string) => {
    setToTeam(teamId);
  };
  
  // Handle transfer submission
  const handleSubmitTransfer = () => {
    setError(null);
    setSuccess(null);
    
    if (transferType === 'internal') {
      // Validate internal transfer
      if (!fromTeam || !toTeam || !selectedPlayer) {
        setError('Selecione o time de origem, o time de destino e o jogador');
        return;
      }
      
      if (fromTeam === toTeam) {
        setError('Os times de origem e destino não podem ser os mesmos');
        return;
      }
    } else {
      // Validate external transfer
      if (!toTeam || !newPlayerName) {
        setError('Selecione o time de destino e informe o nome do novo jogador');
        return;
      }
    }
    
    try {
      if (transferType === 'internal') {
        // Execute internal transfer
        const player = players.find(p => p.id === selectedPlayer);
        if (!player) {
          setError('Jogador não encontrado');
          return;
        }
        
        const success = transferPlayer(selectedPlayer, fromTeam, toTeam, transferAmount);
        
        if (!success) {
          setError('Transferência não pôde ser realizada. Verifique o saldo do time de destino.');
          return;
        }
        
        setSuccess(`Jogador transferido com sucesso para ${getTeamById(toTeam)?.name}`);
      } else {
        // For external transfer, first create the player
        const { addPlayer } = useChampionship();
        const newPlayer = addPlayer({
          name: newPlayerName,
          imageUrl: newPlayerImage,
          teamId: null // No team initially
        });
        
        // Then transfer the new player to the team
        const success = transferPlayer(newPlayer.id, null, toTeam, transferAmount);
        
        if (!success) {
          setError('Transferência não pôde ser realizada. Verifique o saldo do time de destino.');
          return;
        }
        
        setSuccess(`Novo jogador ${newPlayerName} contratado com sucesso para ${getTeamById(toTeam)?.name}`);
      }
      
      // Reset form after successful transfer
      resetForm();
    } catch (err) {
      setError('Erro ao realizar a transferência');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Mercado de Transferências</h2>
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
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Tipo de Transferência</label>
          <div className="flex gap-4">
            <button
              className={`flex-1 py-2 px-4 rounded-md ${
                transferType === 'internal' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => handleTransferTypeChange('internal')}
            >
              Entre Times
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md ${
                transferType === 'external' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => handleTransferTypeChange('external')}
            >
              Novo Jogador
            </button>
          </div>
        </div>
        
        {transferType === 'internal' ? (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Time de Origem</label>
              <select
                className="input w-full"
                value={fromTeam}
                onChange={(e) => handleFromTeamChange(e.target.value)}
              >
                <option value="">Selecione o time de origem</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name} - {team.fjjdotyBalance.toLocaleString()} FJJDOTY
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Jogador</label>
              {fromTeam ? (
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {getTeamPlayers(fromTeam).map(player => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      isSelectable
                      isSelected={selectedPlayer === player.id}
                      onClick={() => setSelectedPlayer(player.id)}
                    />
                  ))}
                  
                  {getTeamPlayers(fromTeam).length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      Este time não possui jogadores
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Selecione um time de origem primeiro
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Novo Jogador</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Nome</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Nome do jogador"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">URL da Imagem (opcional)</label>
                  <input
                    type="url"
                    className="input w-full"
                    placeholder="https://exemplo.com/jogador.jpg"
                    value={newPlayerImage}
                    onChange={(e) => setNewPlayerImage(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Time de Destino</label>
          <select
            className="input w-full"
            value={toTeam}
            onChange={(e) => handleToTeamChange(e.target.value)}
          >
            <option value="">Selecione o time de destino</option>
            {teams
              .filter(team => team.id !== fromTeam) // Filter out the from team for internal transfers
              .map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} - {team.fjjdotyBalance.toLocaleString()} FJJDOTY
                </option>
              ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Valor da Transferência</label>
          <div className="flex items-center">
            <input
              type="number"
              min="0"
              step="1000"
              className="input w-full"
              value={transferAmount}
              onChange={(e) => setTransferAmount(parseInt(e.target.value) || 0)}
            />
            <span className="ml-2 text-secondary font-semibold">FJJDOTY</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Valor padrão: {transferType === 'internal' ? '100.000' : '200.000'} FJJDOTY
          </p>
        </div>
        
        <button
          onClick={handleSubmitTransfer}
          disabled={
            (transferType === 'internal' && (!fromTeam || !toTeam || !selectedPlayer)) ||
            (transferType === 'external' && (!toTeam || !newPlayerName))
          }
          className="btn btn-primary w-full flex items-center justify-center"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {transferType === 'internal' ? 'Realizar Transferência' : 'Contratar Jogador'}
        </button>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Regras de Transferência</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>Transferência entre times: 100.000 FJJDOTY</li>
          <li>Contratação de novo jogador: 200.000 FJJDOTY</li>
          <li>O time deve ter saldo suficiente para a transferência</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminTransfers;