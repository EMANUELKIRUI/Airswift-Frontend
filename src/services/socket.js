import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  // ✅ PREVENT INFINITE RECONNECT LOOP
  if (socket) {
    console.log('Socket already connected');
    return socket;
  }

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://airswift-backend-fjt3.onrender.com';

  socket = io(socketUrl, {
    auth: {
      token
    },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const connectSocket = (token) => {
  if (!token) {
    console.warn('⚠️ No token provided for socket connection');
    return null;
  }

  return initSocket(token);
};

// Socket event helpers
export const emit = (event, data) => {
  if (socket && socket.connected) {
    socket.emit(event, data);
  }
};

export const on = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  }
};

export const off = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
  }
};

export const reconnectSocket = (token) => {
  console.log('🔌 Reconnecting socket with token...')

  if (socket) {
    socket.disconnect()
    socket = null
  }

  if (!token) {
    console.warn('⚠️ No token provided to reconnectSocket')
    return null
  }

  return initSocket(token)
};

export const reconnectSocketConnection = reconnectSocket

export default {
  initSocket,
  connectSocket,
  getSocket,
  disconnectSocket,
  emit,
  on,
  off,
  reconnectSocket,
  reconnectSocketConnection
};