import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (isAuthenticated && token && user) {
      // Connect to WebSocket
      socketService.connect(token);

      // Set up event listeners
      const handleConnectionStatus = (data) => {
        setIsConnected(data.connected);
        if (data.connected) {
          setConnectionError(null);
        }
      };

      const handleConnectionError = (error) => {
        setConnectionError(error.message || 'Connection failed');
        setIsConnected(false);
      };

      const handleUserStatusChanged = (data) => {
        setOnlineUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          if (data.isOnline) {
            return [...filtered, { userId: data.userId, userInfo: data.userInfo }];
          }
          return filtered;
        });
      };

      const handleMaxReconnectAttempts = () => {
        setConnectionError('Unable to connect to server. Please refresh the page.');
      };

      // Register event listeners
      socketService.on('connection_status', handleConnectionStatus);
      socketService.on('connection_error', handleConnectionError);
      socketService.on('user_status_changed', handleUserStatusChanged);
      socketService.on('max_reconnect_attempts_reached', handleMaxReconnectAttempts);

      // Cleanup function
      return () => {
        socketService.off('connection_status', handleConnectionStatus);
        socketService.off('connection_error', handleConnectionError);
        socketService.off('user_status_changed', handleUserStatusChanged);
        socketService.off('max_reconnect_attempts_reached', handleMaxReconnectAttempts);
      };
    } else {
      // Disconnect if not authenticated
      socketService.disconnect();
      setIsConnected(false);
      setOnlineUsers([]);
    }
  }, [isAuthenticated, token, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  const value = {
    isConnected,
    connectionError,
    onlineUsers,
    socketService,
    // Helper methods
    joinTask: (taskId) => socketService.joinTask(taskId),
    leaveTask: (taskId) => socketService.leaveTask(taskId),
    logout: () => socketService.logout(),
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
