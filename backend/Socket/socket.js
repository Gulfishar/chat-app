import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173', // Development frontend
      'https://slrtech-chatapp.onrender.com', // Production frontend
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const userSocketmap = {}; // { userId: socketId }

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId !== "undefine") userSocketmap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketmap));

  socket.on('disconnect', () => {
    delete userSocketmap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketmap));
  });
});

const getReciverSocketId = (userId) => {
  return userSocketmap[userId] || null;
};

export { app, io, server, getReciverSocketId };
