
import React, { useEffect, useRef } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useChampionship } from '../../contexts/ChampionshipContext';

export const RealtimeSync: React.FC = () => {
  const { supabase, isConnected } = useSupabase();
  const { 
    championship,
    teams,
    players,
    matches,
    transfers,
    pastChampions
  } = useChampionship();
  
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);

  useEffect(() => {
    if (!isConnected || !supabase) {
      return;
    }

    // Sync data every 10 seconds when connected to Supabase
    const syncData = async () => {
      try {
        const now = Date.now();
        
        // Only sync if it's been more than 5 seconds since last sync
        if (now - lastSyncRef.current < 5000) {
          return;
        }

        console.log('🔄 Syncing data with Supabase...');
        
        // Check for updates from other devices
        const [
          remoteChampionship,
          remoteTeams,
          remotePlayers,
          remoteMatches,
          remoteTransfers,
          remoteHistory
        ] = await Promise.all([
          supabase.from('championships').select('*').order('updated_at', { ascending: false }).limit(1).single(),
          supabase.from('teams').select('*').order('updated_at', { ascending: false }),
          supabase.from('players').select('*').order('updated_at', { ascending: false }),
          supabase.from('matches').select('*').order('updated_at', { ascending: false }),
          supabase.from('transfers').select('*').order('updated_at', { ascending: false }),
          supabase.from('championship_history').select('*').order('updated_at', { ascending: false })
        ]);

        // Update localStorage with fresh data if it's newer
        const updateLocalStorage = (key: string, localData: any[], remoteData: any[]) => {
          if (remoteData && remoteData.length > 0) {
            const localDataString = JSON.stringify(localData);
            const remoteDataString = JSON.stringify(remoteData);
            
            if (localDataString !== remoteDataString) {
              localStorage.setItem(key, remoteDataString);
              console.log(`📱 Updated ${key} from remote`);
            }
          }
        };

        // Update championship
        if (remoteChampionship.data && championship) {
          const localChampString = JSON.stringify(championship);
          const remoteChampString = JSON.stringify(remoteChampionship.data);
          
          if (localChampString !== remoteChampString) {
            localStorage.setItem('fjj-championship', remoteChampString);
            console.log('📱 Updated championship from remote');
          }
        }

        // Update other data
        updateLocalStorage('fjj-teams', teams, remoteTeams.data || []);
        updateLocalStorage('fjj-players', players, remotePlayers.data || []);
        updateLocalStorage('fjj-matches', matches, remoteMatches.data || []);
        updateLocalStorage('fjj-transfers', transfers, remoteTransfers.data || []);
        updateLocalStorage('fjj-past-champions', pastChampions, remoteHistory.data || []);

        lastSyncRef.current = now;
        
      } catch (error) {
        console.error('❌ Error syncing data:', error);
      }
    };

    // Initial sync
    syncData();

    // Set up periodic sync
    syncIntervalRef.current = setInterval(syncData, 10000);

    // Set up real-time subscriptions if available
    const setupRealtimeSubscriptions = () => {
      const channels = [
        supabase.channel('championships').on('postgres_changes', { event: '*', schema: 'public', table: 'championships' }, syncData),
        supabase.channel('teams').on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, syncData),
        supabase.channel('players').on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, syncData),
        supabase.channel('matches').on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, syncData),
        supabase.channel('transfers').on('postgres_changes', { event: '*', schema: 'public', table: 'transfers' }, syncData),
        supabase.channel('history').on('postgres_changes', { event: '*', schema: 'public', table: 'championship_history' }, syncData)
      ];

      channels.forEach(channel => channel.subscribe());

      return () => {
        channels.forEach(channel => supabase.removeChannel(channel));
      };
    };

    const unsubscribe = setupRealtimeSubscriptions();

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      unsubscribe();
    };
  }, [isConnected, supabase, championship, teams, players, matches, transfers, pastChampions]);

  // This component doesn't render anything, it just handles sync
  return null;
};
