
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Championship, Team, Player, Match, Transfer, ChampionshipHistory } from '../models/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SupabaseContextType {
  // Championship
  saveChampionship: (championship: Championship) => Promise<void>;
  loadChampionship: () => Promise<Championship | null>;
  
  // Teams
  saveTeams: (teams: Team[]) => Promise<void>;
  loadTeams: () => Promise<Team[]>;
  
  // Players
  savePlayers: (players: Player[]) => Promise<void>;
  loadPlayers: () => Promise<Player[]>;
  
  // Matches
  saveMatches: (matches: Match[]) => Promise<void>;
  loadMatches: () => Promise<Match[]>;
  
  // Transfers
  saveTransfers: (transfers: Transfer[]) => Promise<void>;
  loadTransfers: () => Promise<Transfer[]>;
  
  // History
  saveHistory: (history: ChampionshipHistory[]) => Promise<void>;
  loadHistory: () => Promise<ChampionshipHistory[]>;
  
  // Real-time subscriptions
  subscribeToChanges: (callback: () => void) => void;
  unsubscribeFromChanges: () => void;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<any>(null);

  const saveChampionship = async (championship: Championship) => {
    if (!championship) return;
    
    const { error } = await supabase
      .from('championships')
      .upsert({
        id: championship.id,
        name: championship.name,
        season: championship.season,
        status: championship.status,
        max_teams: championship.maxTeams,
        schedule_type: championship.scheduleType,
        winner_id: championship.winner,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error saving championship:', error);
      throw error;
    }
  };

  const loadChampionship = async (): Promise<Championship | null> => {
    const { data, error } = await supabase
      .from('championships')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      name: data.name,
      season: data.season,
      status: data.status,
      teams: [], // Will be loaded separately
      matches: [], // Will be loaded separately
      winner: data.winner_id,
      maxTeams: data.max_teams,
      scheduleType: data.schedule_type,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  };

  const saveTeams = async (teams: Team[]) => {
    const { error } = await supabase
      .from('teams')
      .upsert(teams.map(team => ({
        id: team.id,
        name: team.name,
        logo_url: team.logoUrl,
        background_url: team.backgroundUrl,
        fjjdoty_balance: team.fjjdotyBalance,
        updated_at: new Date().toISOString()
      })));
    
    if (error) {
      console.error('Error saving teams:', error);
      throw error;
    }
  };

  const loadTeams = async (): Promise<Team[]> => {
    const { data, error } = await supabase
      .from('teams')
      .select('*');
    
    if (error || !data) return [];
    
    return data.map(team => ({
      id: team.id,
      name: team.name,
      logoUrl: team.logo_url,
      backgroundUrl: team.background_url,
      fjjdotyBalance: team.fjjdoty_balance,
      players: [], // Will be populated from players table
      createdAt: team.created_at,
      updatedAt: team.updated_at
    }));
  };

  const savePlayers = async (players: Player[]) => {
    const { error } = await supabase
      .from('players')
      .upsert(players.map(player => ({
        id: player.id,
        name: player.name,
        image_url: player.imageUrl,
        team_id: player.teamId,
        goals: player.goals,
        updated_at: new Date().toISOString()
      })));
    
    if (error) {
      console.error('Error saving players:', error);
      throw error;
    }
  };

  const loadPlayers = async (): Promise<Player[]> => {
    const { data, error } = await supabase
      .from('players')
      .select('*');
    
    if (error || !data) return [];
    
    return data.map(player => ({
      id: player.id,
      name: player.name,
      imageUrl: player.image_url,
      teamId: player.team_id,
      goals: player.goals,
      createdAt: player.created_at,
      updatedAt: player.updated_at
    }));
  };

  const saveMatches = async (matches: Match[]) => {
    const { error } = await supabase
      .from('matches')
      .upsert(matches.map(match => ({
        id: match.id,
        championship_id: match.championshipId || null,
        home_team_id: match.homeTeamId,
        away_team_id: match.awayTeamId,
        home_score: match.homeScore,
        away_score: match.awayScore,
        date: match.date,
        played: match.played,
        stage: match.stage,
        match_day: match.matchDay,
        is_manual: match.isManual,
        updated_at: new Date().toISOString()
      })));
    
    if (error) {
      console.error('Error saving matches:', error);
      throw error;
    }
  };

  const loadMatches = async (): Promise<Match[]> => {
    const { data, error } = await supabase
      .from('matches')
      .select('*');
    
    if (error || !data) return [];
    
    return data.map(match => ({
      id: match.id,
      championshipId: match.championship_id,
      homeTeamId: match.home_team_id,
      awayTeamId: match.away_team_id,
      homeScore: match.home_score,
      awayScore: match.away_score,
      date: match.date,
      played: match.played,
      stage: match.stage,
      scorers: [], // Will be loaded from match_scorers
      matchDay: match.match_day,
      isManual: match.is_manual,
      createdAt: match.created_at,
      updatedAt: match.updated_at
    }));
  };

  const saveTransfers = async (transfers: Transfer[]) => {
    const { error } = await supabase
      .from('transfers')
      .upsert(transfers.map(transfer => ({
        id: transfer.id,
        player_id: transfer.playerId,
        from_team_id: transfer.fromTeamId,
        to_team_id: transfer.toTeamId,
        amount: transfer.amount,
        date: transfer.date,
        updated_at: new Date().toISOString()
      })));
    
    if (error) {
      console.error('Error saving transfers:', error);
      throw error;
    }
  };

  const loadTransfers = async (): Promise<Transfer[]> => {
    const { data, error } = await supabase
      .from('transfers')
      .select('*');
    
    if (error || !data) return [];
    
    return data.map(transfer => ({
      id: transfer.id,
      playerId: transfer.player_id,
      fromTeamId: transfer.from_team_id,
      toTeamId: transfer.to_team_id,
      amount: transfer.amount,
      date: transfer.date,
      createdAt: transfer.created_at,
      updatedAt: transfer.updated_at
    }));
  };

  const saveHistory = async (history: ChampionshipHistory[]) => {
    const { error } = await supabase
      .from('championship_history')
      .upsert(history.map(h => ({
        id: h.id,
        season: h.season,
        champion_id: h.championId,
        top_scorer_id: h.topScorerId,
        final_highlights: h.finalHighlights,
        updated_at: new Date().toISOString()
      })));
    
    if (error) {
      console.error('Error saving history:', error);
      throw error;
    }
  };

  const loadHistory = async (): Promise<ChampionshipHistory[]> => {
    const { data, error } = await supabase
      .from('championship_history')
      .select('*');
    
    if (error || !data) return [];
    
    return data.map(h => ({
      id: h.id,
      season: h.season,
      championId: h.champion_id,
      topScorerId: h.top_scorer_id,
      finalHighlights: h.final_highlights,
      createdAt: h.created_at,
      updatedAt: h.updated_at
    }));
  };

  const subscribeToChanges = (callback: () => void) => {
    const channel = supabase
      .channel('championship-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, callback)
      .subscribe();
    
    setSubscription(channel);
  };

  const unsubscribeFromChanges = () => {
    if (subscription) {
      supabase.removeChannel(subscription);
      setSubscription(null);
    }
  };

  useEffect(() => {
    return () => {
      unsubscribeFromChanges();
    };
  }, []);

  const value: SupabaseContextType = {
    saveChampionship,
    loadChampionship,
    saveTeams,
    loadTeams,
    savePlayers,
    loadPlayers,
    saveMatches,
    loadMatches,
    saveTransfers,
    loadTransfers,
    saveHistory,
    loadHistory,
    subscribeToChanges,
    unsubscribeFromChanges
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
