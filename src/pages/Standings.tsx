import React from 'react';
import { LineChart } from 'lucide-react';
import { useChampionship } from '../contexts/ChampionshipContext';
import StandingsTable from '../components/common/StandingsTable';

const Standings: React.FC = () => {
  const { calculateStandings, championship, teams } = useChampionship();
  const standings = calculateStandings();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <LineChart className="mr-2 text-primary" />
        Classificação
      </h1>

      {championship?.status === 'setup' ? (
        <div className="card p-8 text-center">
          <LineChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-xl font-semibold">Campeonato não iniciado</h3>
          <p className="text-gray-500 mt-2">
            A classificação será exibida após o início do campeonato
          </p>
        </div>
      ) : teams.length === 0 ? (
        <div className="card p-8 text-center">
          <LineChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-xl font-semibold">Nenhum time cadastrado</h3>
          <p className="text-gray-500 mt-2">
            Cadastre times no painel administrativo para começar
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 mr-2"></div>
                <span className="text-sm">Zona de classificação para semifinais</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 mr-2"></div>
                <span className="text-sm">Rebaixamento</span>
              </div>
            </div>
          </div>

          <StandingsTable standings={standings} />

          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Legenda:</strong> P = Pontos, J = Jogos, V = Vitórias, E = Empates, D = Derrotas, GP = Gols Pró, GC = Gols Contra, SG = Saldo de Gols</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Standings;