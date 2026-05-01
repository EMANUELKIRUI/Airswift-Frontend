const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.SOCKET_PORT || 3001;
const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error')); 
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = payload;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const user = socket.user;

  socket.join(user.role);
  socket.join(user.id);

  socket.emit('connected', { message: 'Realtime socket connected' });

  socket.on('message:send', (payload) => {
    io.to(payload.receiverId).emit('message:received', payload);
  });

  socket.on('notification:read', (payload) => {
    socket.to(user.id).emit('notification:read', payload);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`Socket server running on port ${port}`);
});