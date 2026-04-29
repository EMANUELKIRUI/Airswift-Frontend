import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

  socket = io(socketUrl, {
    auth: {
      token
    },
    transports: ['websocket', 'polling']
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

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  emit,
  on,
  off
};