import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const ConnectionStatus = () => {
  const { isConnected, connectionError } = useSocket();

  if (connectionError) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg backdrop-blur-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Connection Error</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg backdrop-blur-sm flex items-center space-x-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">Connecting...</span>
        </div>
      </div>
    );
  }

  // Don't show anything when connected - it's expected state
  return null;
};

export default ConnectionStatus;
