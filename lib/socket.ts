import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (token?: string) => {
  if (socket) {
    return socket;
  }

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
    auth: {
      token,
    },
    transports: ['websocket'],
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};