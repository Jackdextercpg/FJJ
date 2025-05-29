import React from 'react';
import { useChampionship } from '../contexts/ChampionshipContext';
import MatchCard from '../components/common/MatchCard';
import { Calendar, Trophy, Users } from 'lucide-react';

const Matches: React.FC = () => {
  const { matches, teams } = useChampionship();

  const groupMatches = matches.filter(match => match.stage === 'group');
  const semifinalMatches = matches.filter(match => match.stage === 'semifinal');
  const finalMatches = matches.filter(match => match.stage === 'final');

  // Agrupar jogos da fase de grupos por rodada
  const groupMatchesByRound = groupMatches.reduce((acc, match) => {
    const round = match.matchDay || 1;
    if (!acc[round]) {
      acc[round] = [];
    }
    acc[round].push(match);
    return acc;
  }, {} as Record<number, typeof groupMatches>);

  // Ordenar as rodadas
  const sortedRounds = Object.keys(groupMatchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Jogos do Campeonato</h1>
        <p className="text-gray-600">Acompanhe todos os jogos da temporada</p>
      </div>

      {/* Fase de Grupos */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Users className="text-primary" size={24} />
          <h2 className="text-2xl font-bold">Fase de Grupos</h2>
        </div>

        {sortedRounds.map(round => (
          <div key={round} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-gray-600" size={20} />
              <h3 className="text-xl font-semibold">Rodada {round}</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupMatchesByRound[round]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    teams={teams} 
                  />
                ))}
            </div>
          </div>
        ))}
      </section>

      {/* Semifinais */}
      {semifinalMatches.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="text-primary" size={24} />
            <h2 className="text-2xl font-bold">Semifinais</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {semifinalMatches
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(match => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  teams={teams} 
                />
              ))}
          </div>
        </section>
      )}

      {/* Final */}
      {finalMatches.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="text-primary" size={24} />
            <h2 className="text-2xl font-bold">Final</h2>
          </div>
          <div className="flex justify-center">
            {finalMatches.map(match => (
              <MatchCard 
                key={match.id} 
                match={match} 
                teams={teams} 
              />
            ))}
          </div>
        </section>
      )}

      {matches.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhum jogo cadastrado ainda</p>
        </div>
      )}
    </div>
  );
};

export default Matches;