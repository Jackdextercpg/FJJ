
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface SupabaseContextType {
  supabase: SupabaseClient | null;
  isConnected: boolean;
}

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  isConnected: false
});

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Se não houver credenciais do Supabase, usar modo local
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials not found. Running in local mode.');
      setIsConnected(false);
      return;
    }

    try {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      setSupabase(supabaseClient);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      setIsConnected(false);
    }
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, isConnected }}>
      {children}
    </SupabaseContext.Provider>
  );
};
