import React, { useState } from 'react';
import { Calendar, CalendarDays, Filter } from 'lucide-react';
import { useChampionship } from '../contexts/ChampionshipContext';
import MatchCard from '../components/common/MatchCard';

const Matches: React.FC = () => {
  const { matches } = useChampionship();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'played' | 'group' | 'semifinal' | 'final'>('all');

  // Group matches by matchDay
  const matchesByDay = matches.reduce<Record<number | string, typeof matches>>((acc, match) => {
    let key: number | string;
    
    if (match.stage === 'group') {
      key = `Rodada ${match.matchDay}`;
    } else if (match.stage === 'semifinal') {
      key = 'Semifinais';
    } else if (match.stage === 'final') {
      key = 'Final';
    } else {
      key = match.matchDay;
    }
    
    if (!acc[key]) {
      acc[key] = [];
    }
    
    acc[key].push(match);
    return acc;
  }, {});

  // Filter matches based on the selected filter
  const filteredMatchDays = Object.entries(matchesByDay)
    .filter(([key, dayMatches]) => {
      if (filter === 'all') return true;
      if (filter === 'upcoming') return dayMatches.some(match => !match.played);
      if (filter === 'played') return dayMatches.some(match => match.played);
      if (filter === 'group') return dayMatches.some(match => match.stage === 'group');
      if (filter === 'semifinal') return dayMatches.some(match => match.stage === 'semifinal');
      if (filter === 'final') return dayMatches.some(match => match.stage === 'final');
      return true;
    })
    .sort((a, b) => {
      // Custom sort: Final, Semifinais, then Rodadas in ascending order
      if (a[0] === 'Final') return 1;
      if (b[0] === 'Final') return -1;
      if (a[0] === 'Semifinais') return 1;
      if (b[0] === 'Semifinais') return -1;
      
      // Extract matchDay number for sorting rodadas
      const aNum = parseInt(a[0].replace('Rodada ', ''));
      const bNum = parseInt(b[0].replace('Rodada ', ''));
      return aNum - bNum;
    });

  const filterMatches = (dayMatches: typeof matches) => {
    if (filter === 'all') return dayMatches;
    if (filter === 'upcoming') return dayMatches.filter(match => !match.played);
    if (filter === 'played') return dayMatches.filter(match => match.played);
    if (filter === 'group') return dayMatches.filter(match => match.stage === 'group');
    if (filter === 'semifinal') return dayMatches.filter(match => match.stage === 'semifinal');
    if (filter === 'final') return dayMatches.filter(match => match.stage === 'final');
    return dayMatches;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Calendar className="mr-2 text-primary" />
        Jogos do Campeonato
      </h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <button 
          onClick={() => setFilter('all')} 
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
        >
          Todos
        </button>
        <button 
          onClick={() => setFilter('upcoming')} 
          className={`btn ${filter === 'upcoming' ? 'btn-primary' : 'btn-outline'}`}
        >
          Próximos
        </button>
        <button 
          onClick={() => setFilter('played')} 
          className={`btn ${filter === 'played' ? 'btn-primary' : 'btn-outline'}`}
        >
          Finalizados
        </button>
        <button 
          onClick={() => setFilter('group')} 
          className={`btn ${filter === 'group' ? 'btn-primary' : 'btn-outline'}`}
        >
          Fase de Grupos
        </button>
        <button 
          onClick={() => setFilter('semifinal')} 
          className={`btn ${filter === 'semifinal' ? 'btn-primary' : 'btn-outline'}`}
        >
          Semifinais
        </button>
        <button 
          onClick={() => setFilter('final')} 
          className={`btn ${filter === 'final' ? 'btn-primary' : 'btn-outline'}`}
        >
          Final
        </button>
      </div>

      {matches.length > 0 ? (
        filteredMatchDays.length > 0 ? (
          filteredMatchDays.map(([day, dayMatches]) => {
            const filteredDayMatches = filterMatches(dayMatches);
            if (filteredDayMatches.length === 0) return null;
            
            return (
              <div key={day} className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CalendarDays className="mr-2 text-primary" />
                  {day}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDayMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="card p-8 text-center">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-xl font-semibold">Nenhum jogo encontrado</h3>
            <p className="text-gray-500 mt-2">
              Tente outro filtro para ver os jogos
            </p>
          </div>
        )
      ) : (
        <div className="card p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-xl font-semibold">Nenhum jogo agendado</h3>
          <p className="text-gray-500 mt-2">
            Os jogos serão gerados quando o campeonato começar
          </p>
        </div>
      )}
    </div>
  );
};

export default Matches;