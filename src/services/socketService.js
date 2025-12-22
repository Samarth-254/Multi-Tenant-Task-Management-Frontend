import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      console.log('🔄 Socket already connected, skipping...');
      return;
    }

    // WebSocket connects to the base server URL, not the API endpoint
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const serverUrl = baseUrl.replace('/api', ''); // Remove /api if present
    console.log('🔌 Connecting to WebSocket server:', serverUrl);
    console.log('🔑 Using token:', token ? 'Present' : 'Missing');

    try {
      this.socket = io(serverUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('❌ Failed to create socket connection:', error);
      this.emit('connection_error', error);
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket server:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 WebSocket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        description: error.description,
        context: error.context,
        type: error.type
      });
      this.isConnected = false;
      this.emit('connection_error', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected to WebSocket server (attempt ${attemptNumber})`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_error', (error) => {
      this.reconnectAttempts++;
      console.error(`🔴 Reconnection failed (attempt ${this.reconnectAttempts}):`, error);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
        this.emit('max_reconnect_attempts_reached');
      }
    });

    // Task-related events
    this.socket.on('task_created', (data) => {
      console.log('📝 New task created:', data.task.title);
      this.emit('task_created', data);
    });

    this.socket.on('task_updated', (data) => {
      console.log('✏️ Task updated:', data.task.title);
      this.emit('task_updated', data);
    });

    this.socket.on('task_deleted', (data) => {
      console.log('🗑️ Task deleted:', data.taskId);
      this.emit('task_deleted', data);
    });

    // User status events
    this.socket.on('user_status_changed', (data) => {
      console.log(`👤 User ${data.userInfo.firstName} ${data.userInfo.lastName} is now ${data.isOnline ? 'online' : 'offline'}`);
      this.emit('user_status_changed', data);
    });

    // Notification events
    this.socket.on('new_notification', (notification) => {
      console.log('🔔 New notification:', notification.title);
      this.emit('new_notification', notification);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting from WebSocket server');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Event emitter functionality
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Task-specific methods
  joinTask(taskId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_task', taskId);
    }
  }

  leaveTask(taskId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_task', taskId);
    }
  }

  // Manual logout (for when user clicks logout)
  logout() {
    if (this.socket && this.isConnected) {
      this.socket.emit('logout');
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socket: this.socket,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
