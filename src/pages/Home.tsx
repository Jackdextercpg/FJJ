import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Calendar, Target, ArrowRight, Trophy, Users, LineChart, Goal } from 'lucide-react';
import { useChampionship } from '../contexts/ChampionshipContext';
import TeamCard from '../components/common/TeamCard';
import MatchCard from '../components/common/MatchCard';
import StandingsTable from '../components/common/StandingsTable';
import TopScorersTable from '../components/common/TopScorersTable';

const Home: React.FC = () => {
  const { 
    championship, 
    teams, 
    matches,
    calculateStandings, 
    getTopScorers,
    pastChampions
  } = useChampionship();

  // Get upcoming and recent matches
  const sortedMatches = [...matches]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const playedMatches = sortedMatches
    .filter(match => match.played)
    .slice(-3)
    .reverse();
  
  const upcomingMatches = sortedMatches
    .filter(match => !match.played)
    .slice(0, 3);

  // Get standings
  const standings = calculateStandings();
  
  // Get top scorers
  const topScorers = getTopScorers(5);

  // Get last champion
  const lastChampion = pastChampions.length > 0
    ? pastChampions[pastChampions.length - 1]
    : null;

  const lastChampionTeam = lastChampion && teams.find(team => team.id === lastChampion.championId);

  return (
    <div>
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="mr-2 text-primary" />
            FJJ
          </h2>

          {championship?.status === 'setup' && (
            <Link to="/admin" className="btn btn-primary text-sm">
              Iniciar Campeonato
            </Link>
          )}
        </div>

        {championship?.status === 'finished' && lastChampionTeam && (
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <p className="text-white/80 mb-1">Campeão da Temporada</p>
                <h3 className="text-2xl font-bold flex items-center">
                  <Trophy className="mr-2 text-secondary" />
                  {lastChampionTeam.name}
                </h3>
              </div>
              <Link to="/champions" className="mt-4 md:mt-0 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md flex items-center">
                Ver histórico de campeões
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  Times Participantes
                </h3>
                <Link to="/teams" className="text-primary hover:underline text-sm flex items-center">
                  Ver todos
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams.slice(0, 4).map(team => (
                  <TeamCard 
                    key={team.id} 
                    team={team} 
                    showBalance={false}
                    showPlayerCount={false}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card p-4 h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  {upcomingMatches.length > 0 ? 'Próximos Jogos' : 'Jogos Recentes'}
                </h3>
                <Link to="/matches" className="text-primary hover:underline text-sm flex items-center">
                  Ver todos
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {upcomingMatches.length > 0 ? (
                  upcomingMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))
                ) : playedMatches.length > 0 ? (
                  playedMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum jogo agendado ainda
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center">
              <LineChart className="w-5 h-5 mr-2 text-primary" />
              Classificação
            </h3>
            <Link to="/standings" className="text-primary hover:underline text-sm flex items-center">
              Ver completa
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          {standings.length > 0 ? (
            <StandingsTable standings={standings} showTitle={false} />
          ) : (
            <div className="card p-6 text-center">
              <p className="text-gray-500">Nenhuma partida jogada ainda</p>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center">
              <Goal className="w-5 h-5 mr-2 text-primary" />
              Artilharia
            </h3>
            <Link to="/top-scorers" className="text-primary hover:underline text-sm flex items-center">
              Ver completa
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          {topScorers.length > 0 ? (
            <TopScorersTable players={topScorers} showTitle={false} limit={5} />
          ) : (
            <div className="card p-6 text-center">
              <p className="text-gray-500">Nenhum gol marcado ainda</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;