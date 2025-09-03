const socketIo = require('socket.io');

let io;

const initSocket = (server) => {
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [
        'https://insightx-ya2k.onrender.com',
        'https://insightx-ten.vercel.app'
      ]
    : ['http://localhost:5173'];

  io = socketIo(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for activity updates
    socket.on('activityUpdate', (data) => {
      const { activityId, message } = data;
      io.emit('activityNotification', { activityId, message });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIo };