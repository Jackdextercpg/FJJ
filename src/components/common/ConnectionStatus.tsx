
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useSupabase } from '../../contexts/SupabaseContext';

export const ConnectionStatus: React.FC = () => {
  const { isConnected } = useSupabase();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isConnected && isOnline) {
      setLastSync(new Date());
    }
  }, [isConnected, isOnline]);

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (isConnected) return 'text-green-500';
    return 'text-yellow-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isConnected) return 'Sincronizado';
    return 'Modo Local';
  };

  const getIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (isConnected) return <Wifi className="w-4 h-4" />;
    return <RefreshCw className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getIcon()}
        <span>{getStatusText()}</span>
      </div>
      {lastSync && isConnected && (
        <span className="text-xs text-gray-500">
          {lastSync.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};
