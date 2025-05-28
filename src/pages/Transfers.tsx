import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useChampionship } from '../contexts/ChampionshipContext';

const Transfers: React.FC = () => {
  const { transfers, getTeamById, getPlayerById } = useChampionship();
  const [filter, setFilter] = useState<'all' | 'internal' | 'external'>('all');
  
  // Sort transfers by date (most recent first)
  const sortedTransfers = [...transfers].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Filter transfers
  const filteredTransfers = sortedTransfers.filter(transfer => {
    if (filter === 'all') return true;
    if (filter === 'internal') return transfer.fromTeamId !== null;
    if (filter === 'external') return transfer.fromTeamId === null;
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <CreditCard className="mr-2 text-primary" />
        Mercado de Transferências
      </h1>

      <div className="mb-6 flex gap-2">
        <button 
          onClick={() => setFilter('all')} 
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
        >
          Todas
        </button>
        <button 
          onClick={() => setFilter('internal')} 
          className={`btn ${filter === 'internal' ? 'btn-primary' : 'btn-outline'}`}
        >
          Entre Times
        </button>
        <button 
          onClick={() => setFilter('external')} 
          className={`btn ${filter === 'external' ? 'btn-primary' : 'btn-outline'}`}
        >
          Contratações Externas
        </button>
      </div>

      {filteredTransfers.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="table-header text-left">Data</th>
                <th className="table-header text-left">Jogador</th>
                <th className="table-header text-left">De</th>
                <th className="table-header text-left">Para</th>
                <th className="table-header text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.map(transfer => {
                const player = getPlayerById(transfer.playerId);
                const fromTeam = transfer.fromTeamId ? getTeamById(transfer.fromTeamId) : null;
                const toTeam = getTeamById(transfer.toTeamId);
                
                const date = new Date(transfer.date).toLocaleDateString('pt-BR');
                
                return (
                  <tr key={transfer.id} className="table-row">
                    <td className="table-cell">{date}</td>
                    <td className="table-cell">{player?.name || 'Desconhecido'}</td>
                    <td className="table-cell">{fromTeam?.name || 'Novo Jogador'}</td>
                    <td className="table-cell">{toTeam?.name || 'Desconhecido'}</td>
                    <td className="table-cell text-right">
                      <span className="font-semibold text-secondary">
                        {transfer.amount.toLocaleString()} FJJDOTY
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-xl font-semibold">Nenhuma transferência realizada</h3>
          <p className="text-gray-500 mt-2">
            As transferências serão exibidas aqui quando realizadas
          </p>
        </div>
      )}
    </div>
  );
};

export default Transfers;