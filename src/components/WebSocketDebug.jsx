import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const WebSocketDebug = () => {
  const { socketService, isConnected, connectionError, onlineUsers } = useSocket();
  const { token, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!socketService) return;

    const addLog = (message, type = 'info') => {
      setLogs(prev => [...prev.slice(-9), {
        id: Date.now(),
        message,
        type,
        timestamp: new Date().toLocaleTimeString()
      }]);
    };

    const handleConnectionStatus = (data) => {
      addLog(`Connection ${data.connected ? 'established' : 'lost'}`, data.connected ? 'success' : 'error');
    };

    const handleConnectionError = (error) => {
      addLog(`Connection error: ${error.message}`, 'error');
    };

    const handleTaskCreated = (data) => {
      addLog(`Task created: ${data.task.title}`, 'success');
    };

    const handleTaskUpdated = (data) => {
      addLog(`Task updated: ${data.task.title}`, 'info');
    };

    const handleTaskDeleted = (data) => {
      addLog(`Task deleted: ${data.taskId}`, 'warning');
    };

    const handleUserStatusChanged = (data) => {
      addLog(`User ${data.userInfo.firstName} is now ${data.isOnline ? 'online' : 'offline'}`, 'info');
    };

    // Register event listeners
    socketService.on('connection_status', handleConnectionStatus);
    socketService.on('connection_error', handleConnectionError);
    socketService.on('task_created', handleTaskCreated);
    socketService.on('task_updated', handleTaskUpdated);
    socketService.on('task_deleted', handleTaskDeleted);
    socketService.on('user_status_changed', handleUserStatusChanged);

    return () => {
      socketService.off('connection_status', handleConnectionStatus);
      socketService.off('connection_error', handleConnectionError);
      socketService.off('task_created', handleTaskCreated);
      socketService.off('task_updated', handleTaskUpdated);
      socketService.off('task_deleted', handleTaskDeleted);
      socketService.off('user_status_changed', handleUserStatusChanged);
    };
  }, [socketService]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        WS Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-dark-800 border border-dark-600 rounded-lg p-4 w-80 max-h-96 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">WebSocket Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-dark-400 hover:text-white text-sm"
        >
          ✕
        </button>
      </div>

      {/* Connection Status */}
      <div className="mb-3">
        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs ${
          isConnected 
            ? 'bg-green-500/10 text-green-400' 
            : 'bg-red-500/10 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        {connectionError && (
          <div className="text-red-400 text-xs mt-1">
            Error: {connectionError}
          </div>
        )}
      </div>

      {/* Connection Info */}
      <div className="mb-3 text-xs text-dark-300">
        <div>Token: {token ? '✓' : '✗'}</div>
        <div>User: {user?.email || 'None'}</div>
        <div>Online Users: {onlineUsers.length}</div>
      </div>

      {/* Event Logs */}
      <div className="space-y-1 max-h-32 overflow-y-auto">
        <div className="text-xs font-medium text-dark-200 mb-1">Recent Events:</div>
        {logs.length === 0 ? (
          <div className="text-xs text-dark-400">No events yet...</div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="text-xs">
              <span className="text-dark-400">{log.timestamp}</span>
              <span className={`ml-2 ${
                log.type === 'success' ? 'text-green-400' :
                log.type === 'error' ? 'text-red-400' :
                log.type === 'warning' ? 'text-yellow-400' :
                'text-blue-400'
              }`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Manual Actions */}
      <div className="mt-3 pt-3 border-t border-dark-600">
        <button
          onClick={() => {
            if (socketService && token) {
              socketService.disconnect();
              setTimeout(() => socketService.connect(token), 1000);
            }
          }}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
        >
          Reconnect
        </button>
      </div>
    </div>
  );
};

export default WebSocketDebug;
