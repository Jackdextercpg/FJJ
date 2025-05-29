
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Championship, Team, Player, Match, Transfer, ChampionshipHistory } from '../models/types';

interface SupabaseService {
  loadChampionship: () => Promise<Championship | null>;
  loadTeams: () => Promise<Team[]>;
  loadPlayers: () => Promise<Player[]>;
  loadMatches: () => Promise<Match[]>;
  loadTransfers: () => Promise<Transfer[]>;
  loadHistory: () => Promise<ChampionshipHistory[]>;
  saveChampionship: (championship: Championship) => Promise<void>;
  saveTeams: (teams: Team[]) => Promise<void>;
  savePlayers: (players: Player[]) => Promise<void>;
  saveMatches: (matches: Match[]) => Promise<void>;
  saveTransfers: (transfers: Transfer[]) => Promise<void>;
  saveHistory: (history: ChampionshipHistory[]) => Promise<void>;
}

interface SupabaseContextType extends SupabaseService {
  supabase: SupabaseClient | null;
  isConnected: boolean;
}

const SupabaseContext = createContext<SupabaseContextType | null>(null);

// Mock service for local mode
const createMockService = (): SupabaseService => ({
  loadChampionship: async () => null,
  loadTeams: async () => [],
  loadPlayers: async () => [],
  loadMatches: async () => [],
  loadTransfers: async () => [],
  loadHistory: async () => [],
  saveChampionship: async () => {},
  saveTeams: async () => {},
  savePlayers: async () => {},
  saveMatches: async () => {},
  saveTransfers: async () => {},
  saveHistory: async () => {},
});

// Real Supabase service
const createSupabaseService = (supabase: SupabaseClient): SupabaseService => ({
  loadChampionship: async () => {
    try {
      const { data, error } = await supabase
        .from('championships')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error loading championship:', error);
      return null;
    }
  },

  loadTeams: async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading teams:', error);
      return [];
    }
  },

  loadPlayers: async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading players:', error);
      return [];
    }
  },

  loadMatches: async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading matches:', error);
      return [];
    }
  },

  loadTransfers: async () => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading transfers:', error);
      return [];
    }
  },

  loadHistory: async () => {
    try {
      const { data, error } = await supabase
        .from('championship_history')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  },

  saveChampionship: async (championship: Championship) => {
    try {
      const { error } = await supabase
        .from('championships')
        .upsert(championship, { onConflict: 'id' });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving championship:', error);
    }
  },

  saveTeams: async (teams: Team[]) => {
    try {
      if (teams.length === 0) return;
      
      const { error } = await supabase
        .from('teams')
        .upsert(teams, { onConflict: 'id' });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving teams:', error);
    }
  },

  savePlayers: async (players: Player[]) => {
    try {
      if (players.length === 0) return;
      
      const { error } = await supabase
        .from('players')
        .upsert(players, { onConflict: 'id' });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving players:', error);
    }
  },

  saveMatches: async (matches: Match[]) => {
    try {
      if (matches.length === 0) return;
      
      const { error } = await supabase
        .from('matches')
        .upsert(matches, { onConflict: 'id' });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving matches:', error);
    }
  },

  saveTransfers: async (transfers: Transfer[]) => {
    try {
      if (transfers.length === 0) return;
      
      const { error } = await supabase
        .from('transfers')
        .upsert(transfers, { onConflict: 'id' });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving transfers:', error);
    }
  },

  saveHistory: async (history: ChampionshipHistory[]) => {
    try {
      if (history.length === 0) return;
      
      const { error } = await supabase
        .from('championship_history')
        .upsert(history, { onConflict: 'id' });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving history:', error);
    }
  },
});

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [service, setService] = useState<SupabaseService>(createMockService());

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('🚀 Starting FJJ Brasileirão App...');
    console.log('Environment variables:', {
      supabaseUrl: supabaseUrl ? '✅ Found' : '❌ Missing',
      supabaseKey: supabaseAnonKey ? '✅ Found' : '❌ Missing'
    });

    // Se não houver credenciais do Supabase, usar modo local
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials not found. Running in local mode.');
      setIsConnected(false);
      setService(createMockService());
      return;
    }

    try {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      setSupabase(supabaseClient);
      setIsConnected(true);
      setService(createSupabaseService(supabaseClient));
      console.log('✅ Supabase connected successfully');
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      setIsConnected(false);
      setService(createMockService());
    }
  }, []);

  const contextValue: SupabaseContextType = {
    supabase,
    isConnected,
    ...service
  };

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = (): SupabaseContextType => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
