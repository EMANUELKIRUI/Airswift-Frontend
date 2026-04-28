/**
 * Socket.IO Client Wrapper
 * Re-exports from services for backward compatibility with @/lib/socket imports
 */

export { 
  getSocket, 
  socket,
  initSocket, 
  disconnectSocket,
  disconnectSocketConnection,
  reconnectSocket,
  reconnectSocketConnection
} from '@/services/socket'

export type { Socket } from 'socket.io-client'
