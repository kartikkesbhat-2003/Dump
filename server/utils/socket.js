const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

const defaultCors = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://dump-frontend-q1mu.onrender.com',
    'https://dump-eight.vercel.app'
  ],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  credentials: true
};

exports.initSocket = (server, opts = {}) => {
  if (io) return io;
  const cors = opts.cors || defaultCors;
  io = new Server(server, { cors });

  io.on('connection', (socket) => {
    try {
      // Support token supplied in handshake.auth.token for identification
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token) {
        try {
          const decoded = jwt.verify(token.replace(/^Bearer\s+/i, ''), process.env.JWT_SECRET);
          const userId = decoded.userId || decoded.id || decoded._id || decoded.user?.userId;
          if (userId) {
            const room = `user_${userId}`;
            socket.join(room);
            // Optionally emit current connection confirmation
            socket.emit('connected', { room });
          }
        } catch (err) {
          // invalid token: ignore join
        }
      }

      socket.on('identify', (payload) => {
        // client may send { token } to identify later
        const token = payload?.token;
        if (!token) return;
        try {
          const decoded = jwt.verify(token.replace(/^Bearer\s+/i, ''), process.env.JWT_SECRET);
          const userId = decoded.userId || decoded.id || decoded._id || decoded.user?.userId;
          if (userId) socket.join(`user_${userId}`);
        } catch (err) {}
      });

      socket.on('disconnect', () => {
        // No-op for now
      });
    } catch (err) {
      console.error('Socket connection error', err);
    }
  });

  return io;
};

exports.getIO = () => io;
