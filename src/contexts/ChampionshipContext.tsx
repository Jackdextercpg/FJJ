import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
import { useSupabase } from './SupabaseContext';

interface ChampionshipContextType {
  championship: Championship | null;
  teams: Team[];
  players: Player[];
  matches: Match[];
  transfers: Transfer[];
  pastChampions: ChampionshipHistory[];

  // Teams
  addTeam: (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'fjjdotyBalance' | 'players'>) => Team;
  updateTeam: (team: Team) => void;
  deleteTeam: (teamId: string) => void;
  getTeamById: (teamId: string) => Team | undefined;

  // Players
  addPlayer: (player: Omit<Player, 'id' | 'createdAt' | 'updatedAt' | 'goals'>) => Player;
  updatePlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;
  getPlayerById: (playerId: string) => Player | undefined;
  getTeamPlayers: (teamId: string) => Player[];

  // Matches
  addMatch: (match: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>) => Match;
  updateMatch: (match: Match) => void;
  updateMatchResult: (matchId: string, homeScore: number, awayScore: number, scorers: GoalScorer[], individualGoals?: GoalScorer[]) => void;
  deleteMatch: (matchId: string) => void;
  getMatchById: (matchId: string) => Match | undefined;
  getTeamMatches: (teamId: string) => Match[];
  generateGroupMatches: () => void;
  generateKnockoutMatches: () => void;

  // Championship
  createChampionship: (name: string, season: string, maxTeams?: number, scheduleType?: 'random' | 'manual') => Championship;
  updateChampionship: (championship: Championship) => void;
  startChampionship: () => void;
  advanceToKnockout: () => void;
  finalizeChampionship: (winnerId: string, topScorerId: string, highlights: string) => void;
  resetChampionship: () => void;

  // Standings and Stats
  calculateStandings: () => TeamStanding[];
  getTopScorers: (limit?: number) => Player[];

  // Transfers
  transferPlayer: (playerId: string, fromTeamId: string | null, toTeamId: string, amount: number) => boolean;
  addTransfer: (transfer: Omit<Transfer, 'id' | 'createdAt' | 'updatedAt'>) => Transfer;
  getTeamTransfers: (teamId: string) => Transfer[];

  // History
  addChampionshipHistory: (history: Omit<ChampionshipHistory, 'id' | 'createdAt' | 'updatedAt'>) => ChampionshipHistory;

  // Loading state
  loading: boolean;
}

const ChampionshipContext = createContext<ChampionshipContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CHAMPIONSHIP: 'fjj-championship',
  TEAMS: 'fjj-teams',
  PLAYERS: 'fjj-players',
  MATCHES: 'fjj-matches',
  TRANSFERS: 'fjj-transfers',
  PAST_CHAMPIONS: 'fjj-past-champions',
};

export const ChampionshipProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [pastChampions, setPastChampions] = useState<ChampionshipHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const supabase = useSupabase();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load from Supabase first, fallback to localStorage
        const [
          supabaseChampionship,
          supabaseTeams,
          supabasePlayers,
          supabaseMatches,
          supabaseTransfers,
          supabaseHistory
        ] = await Promise.all([
          supabase.loadChampionship(),
          supabase.loadTeams(),
          supabase.loadPlayers(),
          supabase.loadMatches(),
          supabase.loadTransfers(),
          supabase.loadHistory()
        ]);

        // If Supabase data exists, use it; otherwise use localStorage
        if (supabaseChampionship || supabaseTeams.length > 0) {
          setChampionship(supabaseChampionship);
          setTeams(supabaseTeams);
          setPlayers(supabasePlayers);
          setMatches(supabaseMatches);
          setTransfers(supabaseTransfers);
          setPastChampions(supabaseHistory);
        } else {
          // Fallback to localStorage
          const championshipData = localStorage.getItem(STORAGE_KEYS.CHAMPIONSHIP);
          const teamsData = localStorage.getItem(STORAGE_KEYS.TEAMS);
          const playersData = localStorage.getItem(STORAGE_KEYS.PLAYERS);
          const matchesData = localStorage.getItem(STORAGE_KEYS.MATCHES);
          const transfersData = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
          const pastChampionsData = localStorage.getItem(STORAGE_KEYS.PAST_CHAMPIONS);

          setChampionship(championshipData ? JSON.parse(championshipData) : null);
          setTeams(teamsData ? JSON.parse(teamsData) : []);
          setPlayers(playersData ? JSON.parse(playersData) : []);
          setMatches(matchesData ? JSON.parse(matchesData) : []);
          setTransfers(transfersData ? JSON.parse(transfersData) : []);
          setPastChampions(pastChampionsData ? JSON.parse(pastChampionsData) : []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        // Fallback to localStorage on error
        const championshipData = localStorage.getItem(STORAGE_KEYS.CHAMPIONSHIP);
        const teamsData = localStorage.getItem(STORAGE_KEYS.TEAMS);
        const playersData = localStorage.getItem(STORAGE_KEYS.PLAYERS);
        const matchesData = localStorage.getItem(STORAGE_KEYS.MATCHES);
        const transfersData = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
        const pastChampionsData = localStorage.getItem(STORAGE_KEYS.PAST_CHAMPIONS);

        setChampionship(championshipData ? JSON.parse(championshipData) : null);
        setTeams(teamsData ? JSON.parse(teamsData) : []);
        setPlayers(playersData ? JSON.parse(playersData) : []);
        setMatches(matchesData ? JSON.parse(matchesData) : []);
        setTransfers(transfersData ? JSON.parse(transfersData) : []);
        setPastChampions(pastChampionsData ? JSON.parse(pastChampionsData) : []);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save to both localStorage and Supabase
  useEffect(() => {
    if (!loading) {
      // Save to localStorage (immediate)
      localStorage.setItem(STORAGE_KEYS.CHAMPIONSHIP, JSON.stringify(championship));
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
      localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
      localStorage.setItem(STORAGE_KEYS.PAST_CHAMPIONS, JSON.stringify(pastChampions));

      // Save to Supabase (background)
      const saveToSupabase = async () => {
        try {
          await Promise.all([
            championship ? supabase.saveChampionship(championship) : Promise.resolve(),
            supabase.saveTeams(teams),
            supabase.savePlayers(players),
            supabase.saveMatches(matches),
            supabase.saveTransfers(transfers),
            supabase.saveHistory(pastChampions)
          ]);
        } catch (error) {
          console.error("Error saving to Supabase:", error);
        }
      };

      saveToSupabase();
    }
  }, [championship, teams, players, matches, transfers, pastChampions, loading]);

  const addTeam = (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'fjjdotyBalance' | 'players'>) => {
    const now = new Date().toISOString();
    const newTeam: Team = {
      id: uuidv4(),
      ...teamData,
      fjjdotyBalance: 50000,
      players: [],
      createdAt: now,
      updatedAt: now
    };

    setTeams(prevTeams => [...prevTeams, newTeam]);
    return newTeam;
  };

  const updateTeam = (updatedTeam: Team) => {
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.id === updatedTeam.id 
          ? { ...updatedTeam, updatedAt: new Date().toISOString() } 
          : team
      )
    );
  };

  const deleteTeam = (teamId: string) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.teamId === teamId 
          ? { ...player, teamId: null, updatedAt: new Date().toISOString() } 
          : player
      )
    );

    setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));

    if (championship && championship.teams.includes(teamId)) {
      setChampionship(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          teams: prev.teams.filter(id => id !== teamId),
          updatedAt: new Date().toISOString()
        };
      });
    }
  };

  const getTeamById = (teamId: string) => {
    return teams.find(team => team.id === teamId);
  };

  const addPlayer = (playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt' | 'goals'>) => {
    const now = new Date().toISOString();
    const newPlayer: Player = {
      id: uuidv4(),
      ...playerData,
      goals: 0,
      createdAt: now,
      updatedAt: now
    };

    setPlayers(prevPlayers => [...prevPlayers, newPlayer]);

    if (newPlayer.teamId) {
      setTeams(prevTeams => 
        prevTeams.map(team => 
          team.id === newPlayer.teamId 
            ? {
                ...team,
                players: [...team.players, newPlayer.id],
                updatedAt: now
              } 
            : team
        )
      );
    }

    return newPlayer;
  };

  const updatePlayer = (updatedPlayer: Player) => {
    const existingPlayer = players.find(p => p.id === updatedPlayer.id);

    if (existingPlayer && existingPlayer.teamId !== updatedPlayer.teamId) {
      if (existingPlayer.teamId) {
        setTeams(prevTeams => 
          prevTeams.map(team => 
            team.id === existingPlayer.teamId 
              ? {
                  ...team,
                  players: team.players.filter(id => id !== updatedPlayer.id),
                  updatedAt: new Date().toISOString()
                } 
              : team
          )
        );
      }

      if (updatedPlayer.teamId) {
        setTeams(prevTeams => 
          prevTeams.map(team => 
            team.id === updatedPlayer.teamId 
              ? {
                  ...team,
                  players: [...team.players, updatedPlayer.id],
                  updatedAt: new Date().toISOString()
                } 
              : team
          )
        );
      }
    }

    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === updatedPlayer.id 
          ? { ...updatedPlayer, updatedAt: new Date().toISOString() } 
          : player
      )
    );
  };

  const deletePlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);

    if (player && player.teamId) {
      setTeams(prevTeams => 
        prevTeams.map(team => 
          team.id === player.teamId 
            ? {
                ...team,
                players: team.players.filter(id => id !== playerId),
                updatedAt: new Date().toISOString()
              } 
            : team
        )
      );
    }

    setPlayers(prevPlayers => prevPlayers.filter(player => player.id !== playerId));
  };

  const getPlayerById = (playerId: string) => {
    return players.find(player => player.id === playerId);
  };

  const getTeamPlayers = (teamId: string) => {
    return players.filter(player => player.teamId === teamId);
  };

  const addMatch = (matchData: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newMatch: Match = {
      id: uuidv4(),
      ...matchData,
      createdAt: now,
      updatedAt: now
    };

    setMatches(prevMatches => [...prevMatches, newMatch]);

    if (championship) {
      setChampionship(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          matches: [...prev.matches, newMatch.id],
          updatedAt: now
        };
      });
    }

    return newMatch;
  };

  const updateMatch = (updatedMatch: Match) => {
    setMatches(prevMatches => 
      prevMatches.map(match => 
        match.id === updatedMatch.id 
          ? { ...updatedMatch, updatedAt: new Date().toISOString() } 
          : match
      )
    );
  };

  const updateMatchResult = (matchId: string, homeScore: number, awayScore: number, scorers: GoalScorer[], individualGoals?: GoalScorer[]) => {
    setMatches(prevMatches => 
      prevMatches.map(match => 
        match.id === matchId 
          ? { 
              ...match, 
              homeScore, 
              awayScore, 
              played: true, 
              scorers: [], // Clear scorers - not used anymore
              individualGoals: individualGoals || [],
              updatedAt: new Date().toISOString() 
            }
          : match
      )
    );

    // Update player goal statistics based only on individualGoals
    const playerGoalMap = new Map<string, number>();

    // Only use individualGoals for player statistics
    if (individualGoals) {
      individualGoals.forEach(scorer => {
        const currentGoals = playerGoalMap.get(scorer.playerId) || 0;
        playerGoalMap.set(scorer.playerId, currentGoals + scorer.count);
      });
    }

    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        const goals = playerGoalMap.get(player.id) || 0;
        if (goals === 0) return player;

        return {
          ...player,
          goals: player.goals + goals,
          updatedAt: new Date().toISOString()
        };
      })
    );

    const match = matches.find(m => m.id === matchId);
    if (match) {
      setTeams(prevTeams => 
        prevTeams.map(team => {
          if (team.id !== match.homeTeamId && team.id !== match.awayTeamId) {
            return team;
          }

          let fjjdotyEarned = 0;
          const isHome = team.id === match.homeTeamId;

          if (isHome && homeScore > awayScore) {
            fjjdotyEarned = 10000;
          } else if (!isHome && awayScore > homeScore) {
            fjjdotyEarned = 10000;
          } else if (homeScore === awayScore) {
            fjjdotyEarned = 3000;
          } else {
            fjjdotyEarned = 1000;
          }

          return {
            ...team,
            fjjdotyBalance: team.fjjdotyBalance + fjjdotyEarned,
            updatedAt: new Date().toISOString()
          };
        })
      );
    }
  };

  const deleteMatch = (matchId: string) => {
    setMatches(prevMatches => prevMatches.filter(match => match.id !== matchId));

    if (championship && championship.matches.includes(matchId)) {
      setChampionship(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          matches: prev.matches.filter(id => id !== matchId),
          updatedAt: new Date().toISOString()
        };
      });
    }
  };

  const getMatchById = (matchId: string) => {
    return matches.find(match => match.id === matchId);
  };

  const getTeamMatches = (teamId: string) => {
    return matches.filter(match => 
      match.homeTeamId === teamId || match.awayTeamId === teamId
    );
  };

  const generateGroupMatches = () => {
    if (!championship) {
      return;
    }

    if (championship.scheduleType === 'manual') {
      return;
    }

    const teamIds = [...championship.teams];
    const now = new Date().toISOString();
    const newMatches: Match[] = [];

    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        const matchDay = Math.floor(i * teamIds.length / 2) + 1;

        const newMatch: Match = {
          id: uuidv4(),
          homeTeamId: teamIds[i],
          awayTeamId: teamIds[j],
          homeScore: null,
          awayScore: null,
          date: new Date(Date.now() + matchDay * 24 * 60 * 60 * 1000).toISOString(),
          played: false,
          stage: 'group',
          scorers: [],
          matchDay,
          isManual: false,
          createdAt: now,
          updatedAt: now
        };

        newMatches.push(newMatch);
      }
    }

    setMatches(prev => [...prev, ...newMatches]);

    setChampionship(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        matches: [...prev.matches, ...newMatches.map(m => m.id)],
        status: 'group',
        updatedAt: now
      };
    });

    return newMatches;
  };

  const generateKnockoutMatches = () => {
    if (!championship || championship.status !== 'group') {
      return;
    }

    const standings = calculateStandings();
    const numTeamsInKnockout = championship.maxTeams >= 16 ? 8 : 4;
    const topTeams = standings.slice(0, numTeamsInKnockout).map(standing => standing.teamId);

    if (topTeams.length < numTeamsInKnockout) {
      return;
    }

    const now = new Date().toISOString();
    const newMatches: Match[] = [];

    if (numTeamsInKnockout === 8) {
      for (let i = 0; i < 4; i++) {
        const quarterFinal: Match = {
          id: uuidv4(),
          homeTeamId: topTeams[i],
          awayTeamId: topTeams[7 - i],
          homeScore: null,
          awayScore: null,
          date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          played: false,
          stage: 'quarterfinal',
          scorers: [],
          matchDay: 1,
          isManual: false,
          createdAt: now,
          updatedAt: now
        };
        newMatches.push(quarterFinal);
      }
    }

    const semiFinalTeams = numTeamsInKnockout === 4 ? topTeams : ['TBD', 'TBD', 'TBD', 'TBD'];

    const semifinal1: Match = {
      id: uuidv4(),
      homeTeamId: semiFinalTeams[0],
      awayTeamId: semiFinalTeams[3],
      homeScore: null,
      awayScore: null,
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      played: false,
      stage: 'semifinal',
      scorers: [],
      matchDay: numTeamsInKnockout === 8 ? 2 : 1,
      isManual: false,
      createdAt: now,
      updatedAt: now
    };

    const semifinal2: Match = {
      id: uuidv4(),
      homeTeamId: semiFinalTeams[1],
      awayTeamId: semiFinalTeams[2],
      homeScore: null,
      awayScore: null,
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      played: false,
      stage: 'semifinal',
      scorers: [],
      matchDay: numTeamsInKnockout === 8 ? 2 : 1,
      isManual: false,
      createdAt: now,
      updatedAt: now
    };

    const final: Match = {
      id: uuidv4(),
      homeTeamId: 'TBD',
      awayTeamId: 'TBD',
      homeScore: null,
      awayScore: null,
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      played: false,
      stage: 'final',
      scorers: [],
      matchDay: numTeamsInKnockout === 8 ? 3 : 2,
      isManual: false,
      createdAt: now,
      updatedAt: now
    };

    newMatches.push(semifinal1, semifinal2, final);

    setMatches(prev => [...prev, ...newMatches]);

    setChampionship(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        matches: [...prev.matches, ...newMatches.map(m => m.id)],
        status: 'knockout',
        updatedAt: now
      };
    });

    return newMatches;
  };

  const createChampionship = (
    name: string, 
    season: string,
    maxTeams: number = 6,
    scheduleType: 'random' | 'manual' = 'random'
  ) => {
    const now = new Date().toISOString();
    const newChampionship: Championship = {
      id: uuidv4(),
      name,
      season,
      status: 'setup',
      teams: [],
      matches: [],
      winner: null,
      maxTeams,
      scheduleType,
      createdAt: now,
      updatedAt: now
    };

    setChampionship(newChampionship);
    return newChampionship;
  };

  const updateChampionship = (updatedChampionship: Championship) => {
    setChampionship({
      ...updatedChampionship,
      updatedAt: new Date().toISOString()
    });
  };

  const startChampionship = () => {
    if (!championship || championship.teams.length !== championship.maxTeams) {
      return false;
    }

    setPlayers(prevPlayers => 
      prevPlayers.map(player => ({
        ...player,
        goals: 0,
        updatedAt: new Date().toISOString()
      }))
    );

    setMatches([]);

    generateGroupMatches();

    return true;
  };

  const advanceToKnockout = () => {
    if (!championship) return false;

    const groupMatches = matches.filter(match => match.stage === 'group');
    const allPlayed = groupMatches.every(match => match.played);

    if (!allPlayed) {
      return false;
    }

    generateKnockoutMatches();

    return true;
  };

  const finalizeChampionship = (winnerId: string, topScorerId: string, highlights: string) => {
    if (!championship) return false;

    const championshipHistory: ChampionshipHistory = {
      id: uuidv4(),
      season: championship.season,
      championId: winnerId,
      topScorerId: topScorerId,
      finalHighlights: highlights,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPastChampions(prev => [...prev, championshipHistory]);

    setChampionship(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: 'finished',
        winner: winnerId,
        updatedAt: new Date().toISOString()
      };
    });

    return true;
  };

  const resetChampionship = () => {
    setChampionship(null);
    setMatches([]);
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
        awayTeamStanding.goalDifference = awayTeamStanding.goalsFor - homeTeamStanding.goalsAgainst;
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

  const transferPlayer = (playerId: string, fromTeamId: string | null, toTeamId: string, amount: number): boolean => {
    const player = players.find(p => p.id === playerId);
    const toTeam = teams.find(t => t.id === toTeamId);

    if (!player || !toTeam) {
      return false;
    }

    if (fromTeamId) {
      const fromTeam = teams.find(t => t.id === fromTeamId);
      if (!fromTeam) {
        return false;
      }

      if (toTeam.fjjdotyBalance < amount) {
        return false;
      }

      setTeams(prevTeams => 
        prevTeams.map(team => {
          if (team.id === fromTeamId) {
            return {
              ...team,
              fjjdotyBalance: team.fjjdotyBalance + amount,
              players: team.players.filter(id => id !== playerId),
              updatedAt: new Date().toISOString()
            };
          }
          if (team.id === toTeamId) {
            return {
              ...team,
              fjjdotyBalance: team.fjjdotyBalance - amount,
              players: [...team.players, playerId],
              updatedAt: new Date().toISOString()
            };
          }
          return team;
        })
      );
    } else {
      if (toTeam.fjjdotyBalance < amount) {
        return false;
      }

      setTeams(prevTeams => 
        prevTeams.map(team => {
          if (team.id === toTeamId) {
            return {
              ...team,
              fjjdotyBalance: team.fjjdotyBalance - amount,
              players: [...team.players, playerId],
              updatedAt: new Date().toISOString()
            };
          }
          return team;
        })
      );
    }

    setPlayers(prevPlayers => 
      prevPlayers.map(p => 
        p.id === playerId 
          ? { ...p, teamId: toTeamId, updatedAt: new Date().toISOString() } 
          : p
      )
    );

    addTransfer({
      playerId,
      fromTeamId,
      toTeamId,
      amount,
      date: new Date().toISOString(),
    });

    return true;
  };

  const addTransfer = (transferData: Omit<Transfer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTransfer: Transfer = {
      id: uuidv4(),
      ...transferData,
      createdAt: now,
      updatedAt: now
    };

    setTransfers(prev => [...prev, newTransfer]);
    return newTransfer;
  };

  const getTeamTransfers = (teamId: string) => {
    return transfers.filter(transfer => 
      transfer.fromTeamId === teamId || transfer.toTeamId === teamId
    );
  };

  const addChampionshipHistory = (historyData: Omit<ChampionshipHistory, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newHistory: ChampionshipHistory = {
      id: uuidv4(),
      ...historyData,
      createdAt: now,
      updatedAt: now
    };

    setPastChampions(prev => [...prev, newHistory]);
    return newHistory;
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
    getTeamById,


    addPlayer,
    updatePlayer,
    deletePlayer,
    getPlayerById,
    getTeamPlayers,

    addMatch,
    updateMatch,
    updateMatchResult,
    deleteMatch,
    getMatchById,
    getTeamMatches,
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