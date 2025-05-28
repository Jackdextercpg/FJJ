import React from 'react';
import { Target, Users } from 'lucide-react';
import { useChampionship } from '../contexts/ChampionshipContext';
import TopScorersTable from '../components/common/TopScorersTable';

const TopScorers: React.FC = () => {
  const { getTopScorers } = useChampionship();
  const topScorers = getTopScorers();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Target className="mr-2 text-primary" />
        Artilharia do Campeonato
      </h1>

      {topScorers.length > 0 ? (
        <TopScorersTable players={topScorers} />
      ) : (
        <div className="card p-8 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-xl font-semibold">Nenhum gol registrado</h3>
          <p className="text-gray-500 mt-2">
            A artilharia será atualizada conforme os jogos forem realizados
          </p>
        </div>
      )}
    </div>
  );
};

export default TopScorers;