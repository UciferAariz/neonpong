const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// In-memory room store. For production use a persistent store.
// rooms: Map<roomId, { pass, hostSocketId, players: Set<socketId> }>
const rooms = new Map();

function genId(len = 6) {
  return Math.random().toString(36).substring(2, 2 + len).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('[socket] connected', socket.id);

  socket.on('createRoom', (callback) => {
    const roomId = genId(6);
    const roomPass = genId(8);

    rooms.set(roomId, {
      pass: roomPass,
      hostSocketId: socket.id,
      players: new Set([socket.id]),
    });

    socket.join(roomId);

    console.log(`[room] created ${roomId} by ${socket.id}`);
    if (typeof callback === 'function') callback({ roomId, roomPass });
  });

  socket.on('joinRoom', ({ roomId, roomPass }, callback) => {
    const room = rooms.get(roomId);
    if (!room) {
      if (typeof callback === 'function') callback({ error: 'Room not found' });
      return;
    }

    if (room.pass !== roomPass) {
      if (typeof callback === 'function') callback({ error: 'Invalid password' });
      return;
    }

    room.players.add(socket.id);
    socket.join(roomId);

    console.log(`[room] joined ${roomId} by ${socket.id}`);

    // Notify the host that a player joined so the host can auto-start
    const hostSocket = io.sockets.sockets.get(room.hostSocketId);
    if (hostSocket) {
      hostSocket.emit('roomJoined', { roomId, playerId: socket.id });
    }

    // Notify the joining player they have joined
    socket.emit('roomJoined', { roomId, playerId: socket.id });

    if (typeof callback === 'function') callback({ ok: true });
  });

  socket.on('startGame', ({ roomId }) => {
    if (!roomId) return;
    console.log(`[game] start requested for ${roomId} by ${socket.id}`);
    io.to(roomId).emit('startGame', { roomId });
  });

  socket.on('disconnect', () => {
    console.log('[socket] disconnected', socket.id);
    // Clean up socket from any rooms
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
        // If host left, try to promote another player to host or delete the room
        if (room.hostSocketId === socket.id) {
          const next = room.players.values().next();
          if (next && !next.done) {
            room.hostSocketId = next.value;
            const newHost = io.sockets.sockets.get(room.hostSocketId);
            if (newHost) newHost.emit('promotedToHost', { roomId });
          } else {
            rooms.delete(roomId);
            console.log(`[room] deleted empty ${roomId}`);
          }
        } else {
          // Notify remaining players
          io.to(roomId).emit('playerLeft', { roomId, playerId: socket.id });
        }
      }
    }
  });
});

app.get('/', (req, res) => {
  res.send('Pong Pulse backend is running');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
