import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { 
  Championship, 
  Team, 
  Player, 
  Match, 
  Transfer, 
  TeamStanding,
  ChampionshipHistory,
  GoalScorer
} from '../models/types';

interface ChampionshipContextType {
  championship: Championship | null;
  teams: Team[];
  players: Player[];
  matches: Match[];
  transfers: Transfer[];
  pastChampions: ChampionshipHistory[];
  
  // Teams
  addTeam: (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'fjjdotyBalance' | 'players'>) => Promise<Team>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  getTeamById: (teamId: string) => Team | undefined;
  
  // Players
  addPlayer: (player: Omit<Player, 'id' | 'createdAt' | 'updatedAt' | 'goals'>) => Promise<Player>;
  updatePlayer: (player: Player) => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
  getPlayerById: (playerId: string) => Player | undefined;
  getTeamPlayers: (teamId: string) => Player[];
  
  // Matches
  addMatch: (match: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Match>;
  updateMatch: (match: Match) => Promise<void>;
  updateMatchResult: (matchId: string, homeScore: number, awayScore: number, scorers: GoalScorer[]) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  getMatchById: (matchId: string) => Match | undefined;
  getTeamMatches: (teamId: string) => Match[];
  generateGroupMatches: () => Promise<void>;
  generateKnockoutMatches: () => Promise<void>;
  
  // Championship
  createChampionship: (name: string, season: string, maxTeams?: number, scheduleType?: 'random' | 'manual') => Promise<Championship>;
  updateChampionship: (championship: Championship) => Promise<void>;
  startChampionship: () => Promise<void>;
  advanceToKnockout: () => Promise<void>;
  finalizeChampionship: (winnerId: string, topScorerId: string, highlights: string) => Promise<void>;
  resetChampionship: () => Promise<void>;
  
  // Standings and Stats
  calculateStandings: () => TeamStanding[];
  getTopScorers: (limit?: number) => Player[];
  
  // Transfers
  transferPlayer: (playerId: string, fromTeamId: string | null, toTeamId: string, amount: number) => Promise<boolean>;
  addTransfer: (transfer: Omit<Transfer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Transfer>;
  getTeamTransfers: (teamId: string) => Transfer[];
  
  // History
  addChampionshipHistory: (history: Omit<ChampionshipHistory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ChampionshipHistory>;
  
  // Loading state
  loading: boolean;
}

const ChampionshipContext = createContext<ChampionshipContextType | undefined>(undefined);

export const ChampionshipProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [pastChampions, setPastChampions] = useState<ChampionshipHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          { data: championshipData },
          { data: teamsData },
          { data: playersData },
          { data: matchesData },
          { data: transfersData },
          { data: historyData }
        ] = await Promise.all([
          supabase.from('championships').select('*').maybeSingle(),
          supabase.from('teams').select('*'),
          supabase.from('players').select('*'),
          supabase.from('matches').select('*'),
          supabase.from('transfers').select('*'),
          supabase.from('championship_history').select('*')
        ]);

        setChampionship(championshipData);
        setTeams(teamsData || []);
        setPlayers(playersData || []);
        setMatches(matchesData || []);
        setTransfers(transfersData || []);
        setPastChampions(historyData || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const championshipSubscription = supabase
      .channel('championship-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'championships' }, 
        payload => {
          if (payload.new) {
            setChampionship(payload.new as Championship);
          }
        }
      )
      .subscribe();

    const teamsSubscription = supabase
      .channel('teams-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' },
        async () => {
          const { data } = await supabase.from('teams').select('*');
          setTeams(data || []);
        }
      )
      .subscribe();

    const playersSubscription = supabase
      .channel('players-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' },
        async () => {
          const { data } = await supabase.from('players').select('*');
          setPlayers(data || []);
        }
      )
      .subscribe();

    const matchesSubscription = supabase
      .channel('matches-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' },
        async () => {
          const { data } = await supabase.from('matches').select('*');
          setMatches(data || []);
        }
      )
      .subscribe();

    const transfersSubscription = supabase
      .channel('transfers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transfers' },
        async () => {
          const { data } = await supabase.from('transfers').select('*');
          setTransfers(data || []);
        }
      )
      .subscribe();

    const historySubscription = supabase
      .channel('history-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'championship_history' },
        async () => {
          const { data } = await supabase.from('championship_history').select('*');
          setPastChampions(data || []);
        }
      )
      .subscribe();

    return () => {
      championshipSubscription.unsubscribe();
      teamsSubscription.unsubscribe();
      playersSubscription.unsubscribe();
      matchesSubscription.unsubscribe();
      transfersSubscription.unsubscribe();
      historySubscription.unsubscribe();
    };
  }, []);

  const addTeam = async (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'fjjdotyBalance' | 'players'>) => {
    const { data, error } = await supabase
      .from('teams')
      .insert({
        ...teamData,
        fjjdoty_balance: 50000,
        players: []
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateTeam = async (team: Team) => {
    const { error } = await supabase
      .from('teams')
      .update(team)
      .eq('id', team.id);

    if (error) throw error;
  };

  const deleteTeam = async (teamId: string) => {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;

    // Update related players
    await supabase
      .from('players')
      .update({ team_id: null })
      .eq('team_id', teamId);
  };

  const addPlayer = async (playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt' | 'goals'>) => {
    const { data, error } = await supabase
      .from('players')
      .insert({
        ...playerData,
        goals: 0
      })
      .select()
      .single();

    if (error) throw error;

    if (playerData.teamId) {
      await supabase
        .from('teams')
        .update({
          players: supabase.raw('array_append(players, ?)', [data.id])
        })
        .eq('id', playerData.teamId);
    }

    return data;
  };

  const updatePlayer = async (player: Player) => {
    const { error } = await supabase
      .from('players')
      .update(player)
      .eq('id', player.id);

    if (error) throw error;
  };

  const deletePlayer = async (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    
    if (player?.teamId) {
      await supabase
        .from('teams')
        .update({
          players: supabase.raw('array_remove(players, ?)', [playerId])
        })
        .eq('id', player.teamId);
    }

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (error) throw error;
  };

  const addMatch = async (matchData: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('matches')
      .insert(matchData)
      .select()
      .single();

    if (error) throw error;

    if (championship) {
      await supabase
        .from('championships')
        .update({
          matches: supabase.raw('array_append(matches, ?)', [data.id])
        })
        .eq('id', championship.id);
    }

    return data;
  };

  const updateMatch = async (match: Match) => {
    const { error } = await supabase
      .from('matches')
      .update(match)
      .eq('id', match.id);

    if (error) throw error;
  };

  const updateMatchResult = async (matchId: string, homeScore: number, awayScore: number, scorers: GoalScorer[]) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');

    // Update match
    await supabase
      .from('matches')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        played: true,
        scorers
      })
      .eq('id', matchId);

    // Update player goals
    for (const scorer of scorers) {
      await supabase
        .from('players')
        .update({
          goals: supabase.raw('goals + ?', [scorer.count])
        })
        .eq('id', scorer.playerId);
    }

    // Update team balances
    const homeTeamUpdate = {
      fjjdoty_balance: supabase.raw('fjjdoty_balance + ?', [
        homeScore > awayScore ? 10000 : homeScore === awayScore ? 3000 : 1000
      ])
    };

    const awayTeamUpdate = {
      fjjdoty_balance: supabase.raw('fjjdoty_balance + ?', [
        awayScore > homeScore ? 10000 : homeScore === awayScore ? 3000 : 1000
      ])
    };

    await Promise.all([
      supabase
        .from('teams')
        .update(homeTeamUpdate)
        .eq('id', match.homeTeamId),
      supabase
        .from('teams')
        .update(awayTeamUpdate)
        .eq('id', match.awayTeamId)
    ]);
  };

  const deleteMatch = async (matchId: string) => {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);

    if (error) throw error;

    if (championship && championship.matches.includes(matchId)) {
      await supabase
        .from('championships')
        .update({
          matches: supabase.raw('array_remove(matches, ?)', [matchId])
        })
        .eq('id', championship.id);
    }
  };

  const createChampionship = async (
    name: string,
    season: string,
    maxTeams: number = 6,
    scheduleType: 'random' | 'manual' = 'random'
  ) => {
    const { data, error } = await supabase
      .from('championships')
      .insert({
        name,
        season,
        status: 'setup',
        teams: [],
        matches: [],
        winner: null,
        max_teams: maxTeams,
        schedule_type: scheduleType
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateChampionship = async (championship: Championship) => {
    const { error } = await supabase
      .from('championships')
      .update(championship)
      .eq('id', championship.id);

    if (error) throw error;
  };

  const startChampionship = async () => {
    if (!championship || championship.teams.length !== championship.maxTeams) {
      throw new Error('Invalid championship state');
    }

    // Reset player goals
    await supabase
      .from('players')
      .update({ goals: 0 })
      .in('team_id', championship.teams);

    // Clear existing matches
    await supabase
      .from('matches')
      .delete()
      .in('id', championship.matches);

    await generateGroupMatches();
  };

  const generateGroupMatches = async () => {
    if (!championship || championship.scheduleType === 'manual') return;

    const teamIds = [...championship.teams];
    const newMatches: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        const matchDay = Math.floor(i * teamIds.length / 2) + 1;
        
        newMatches.push({
          homeTeamId: teamIds[i],
          awayTeamId: teamIds[j],
          homeScore: null,
          awayScore: null,
          date: new Date(Date.now() + matchDay * 24 * 60 * 60 * 1000).toISOString(),
          played: false,
          stage: 'group',
          scorers: [],
          matchDay,
          isManual: false
        });
      }
    }

    const { data: createdMatches, error } = await supabase
      .from('matches')
      .insert(newMatches)
      .select();

    if (error) throw error;

    await supabase
      .from('championships')
      .update({
        matches: createdMatches.map(m => m.id),
        status: 'group'
      })
      .eq('id', championship.id);
  };

  const generateKnockoutMatches = async () => {
    if (!championship || championship.status !== 'group') return;

    const standings = calculateStandings();
    const numTeamsInKnockout = championship.maxTeams >= 16 ? 8 : 4;
    const topTeams = standings.slice(0, numTeamsInKnockout).map(standing => standing.teamId);

    if (topTeams.length < numTeamsInKnockout) return;

    const newMatches: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    if (numTeamsInKnockout === 8) {
      for (let i = 0; i < 4; i++) {
        newMatches.push({
          homeTeamId: topTeams[i],
          awayTeamId: topTeams[7 - i],
          homeScore: null,
          awayScore: null,
          date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          played: false,
          stage: 'quarterfinal',
          scorers: [],
          matchDay: 1,
          isManual: false
        });
      }
    }

    const semiFinalTeams = numTeamsInKnockout === 4 ? topTeams : ['TBD', 'TBD', 'TBD', 'TBD'];

    newMatches.push(
      {
        homeTeamId: semiFinalTeams[0],
        awayTeamId: semiFinalTeams[3],
        homeScore: null,
        awayScore: null,
        date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        played: false,
        stage: 'semifinal',
        scorers: [],
        matchDay: numTeamsInKnockout === 8 ? 2 : 1,
        isManual: false
      },
      {
        homeTeamId: semiFinalTeams[1],
        awayTeamId: semiFinalTeams[2],
        homeScore: null,
        awayScore: null,
        date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        played: false,
        stage: 'semifinal',
        scorers: [],
        matchDay: numTeamsInKnockout === 8 ? 2 : 1,
        isManual: false
      },
      {
        homeTeamId: 'TBD',
        awayTeamId: 'TBD',
        homeScore: null,
        awayScore: null,
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        played: false,
        stage: 'final',
        scorers: [],
        matchDay: numTeamsInKnockout === 8 ? 3 : 2,
        isManual: false
      }
    );

    const { data: createdMatches, error } = await supabase
      .from('matches')
      .insert(newMatches)
      .select();

    if (error) throw error;

    await supabase
      .from('championships')
      .update({
        matches: createdMatches.map(m => m.id),
        status: 'knockout'
      })
      .eq('id', championship.id);
  };

  const advanceToKnockout = async () => {
    if (!championship) return;

    const groupMatches = matches.filter(match => match.stage === 'group');
    const allPlayed = groupMatches.every(match => match.played);

    if (!allPlayed) return;

    await generateKnockoutMatches();
  };

  const finalizeChampionship = async (winnerId: string, topScorerId: string, highlights: string) => {
    if (!championship) return;

    await supabase
      .from('championships')
      .update({
        status: 'finished',
        winner: winnerId
      })
      .eq('id', championship.id);

    await addChampionshipHistory({
      season: championship.season,
      championId: winnerId,
      topScorerId,
      finalHighlights: highlights
    });
  };

  const resetChampionship = async () => {
    if (!championship) return;

    await supabase
      .from('championships')
      .update({
        status: 'setup',
        teams: [],
        matches: [],
        winner: null
      })
      .eq('id', championship.id);

    await supabase
      .from('matches')
      .delete()
      .in('id', championship.matches);
  };

  const calculateStandings = (): TeamStanding[] => {
    const teamStandings = new Map<string, TeamStanding>();

    teams.forEach(team => {
      teamStandings.set(team.id, {
        teamId: team.id,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      });
    });

    matches
      .filter(match => match.played && match.stage === 'group')
      .forEach(match => {
        const homeTeamStanding = teamStandings.get(match.homeTeamId);
        const awayTeamStanding = teamStandings.get(match.awayTeamId);

        if (!homeTeamStanding || !awayTeamStanding || match.homeScore === null || match.awayScore === null) {
          return;
        }

        homeTeamStanding.played += 1;
        homeTeamStanding.goalsFor += match.homeScore;
        homeTeamStanding.goalsAgainst += match.awayScore;

        awayTeamStanding.played += 1;
        awayTeamStanding.goalsFor += match.awayScore;
        awayTeamStanding.goalsAgainst += match.homeScore;

        if (match.homeScore > match.awayScore) {
          homeTeamStanding.points += 3;
          homeTeamStanding.won += 1;
          awayTeamStanding.lost += 1;
        } else if (match.homeScore < match.awayScore) {
          awayTeamStanding.points += 3;
          awayTeamStanding.won += 1;
          homeTeamStanding.lost += 1;
        } else {
          homeTeamStanding.points += 1;
          awayTeamStanding.points += 1;
          homeTeamStanding.drawn += 1;
          awayTeamStanding.drawn += 1;
        }

        homeTeamStanding.goalDifference = homeTeamStanding.goalsFor - homeTeamStanding.goalsAgainst;
        awayTeamStanding.goalDifference = awayTeamStanding.goalsFor - awayTeamStanding.goalsAgainst;
      });

    return Array.from(teamStandings.values())
      .sort((a, b) => {
        if (a.points !== b.points) {
          return b.points - a.points;
        }

        if (a.goalDifference !== b.goalDifference) {
          return b.goalDifference - a.goalDifference;
        }

        if (a.goalsFor !== b.goalsFor) {
          return b.goalsFor - a.goalsFor;
        }

        const teamA = teams.find(team => team.id === a.teamId);
        const teamB = teams.find(team => team.id === b.teamId);
        return (teamA?.name || '').localeCompare(teamB?.name || '');
      });
  };

  const getTopScorers = (limit = 10): Player[] => {
    return [...players]
      .filter(player => player.goals > 0)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, limit);
  };

  const transferPlayer = async (
    playerId: string,
    fromTeamId: string | null,
    toTeamId: string,
    amount: number
  ): Promise<boolean> => {
    const player = players.find(p => p.id === playerId);
    const toTeam = teams.find(t => t.id === toTeamId);

    if (!player || !toTeam || toTeam.fjjdotyBalance < amount) {
      return false;
    }

    if (fromTeamId) {
      const fromTeam = teams.find(t => t.id === fromTeamId);
      if (!fromTeam) return false;

      await supabase.from('teams').update({
        fjjdoty_balance: fromTeam.fjjdotyBalance + amount,
        players: fromTeam.players.filter(id => id !== playerId)
      }).eq('id', fromTeamId);
    }

    await supabase.from('teams').update({
      fjjdoty_balance: toTeam.fjjdotyBalance - amount,
      players: [...toTeam.players, playerId]
    }).eq('id', toTeamId);

    await supabase.from('players').update({
      team_id: toTeamId
    }).eq('id', playerId);

    await addTransfer({
      playerId,
      fromTeamId,
      toTeamId,
      amount,
      date: new Date().toISOString()
    });

    return true;
  };

  const addTransfer = async (transferData: Omit<Transfer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('transfers')
      .insert(transferData)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const getTeamTransfers = (teamId: string) => {
    return transfers.filter(transfer =>
      transfer.fromTeamId === teamId || transfer.toTeamId === teamId
    );
  };

  const addChampionshipHistory = async (historyData: Omit<ChampionshipHistory, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('championship_history')
      .insert(historyData)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const value: ChampionshipContextType = {
    championship,
    teams,
    players,
    matches,
    transfers,
    pastChampions,
    loading,
    addTeam,
    updateTeam,
    deleteTeam,
    getTeamById: (teamId) => teams.find(team => team.id === teamId),
    addPlayer,
    updatePlayer,
    deletePlayer,
    getPlayerById: (playerId) => players.find(player => player.id === playerId),
    getTeamPlayers: (teamId) => players.filter(player => player.teamId === teamId),
    addMatch,
    updateMatch,
    updateMatchResult,
    deleteMatch,
    getMatchById: (matchId) => matches.find(match => match.id === matchId),
    getTeamMatches: (teamId) => matches.filter(match =>
      match.homeTeamId === teamId || match.awayTeamId === teamId
    ),
    generateGroupMatches,
    generateKnockoutMatches,
    createChampionship,
    updateChampionship,
    startChampionship,
    advanceToKnockout,
    finalizeChampionship,
    resetChampionship,
    calculateStandings,
    getTopScorers,
    transferPlayer,
    addTransfer,
    getTeamTransfers,
    addChampionshipHistory
  };

  return (
    <ChampionshipContext.Provider value={value}>
      {children}
    </ChampionshipContext.Provider>
  );
};

export const useChampionship = () => {
  const context = useContext(ChampionshipContext);
  if (context === undefined) {
    throw new Error('useChampionship must be used within a ChampionshipProvider');
  }
  return context;
};