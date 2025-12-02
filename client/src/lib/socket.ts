import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (token?: string) => {
  if (socket) return socket;
  const BASE = import.meta.env.VITE_API_BASE_URL || '';
  const url = BASE.replace(/\/$/, '');
  socket = io(url, { auth: { token: token ? token.replace(/^"|"$/g, '') : (localStorage.getItem('token') || '') }, transports: ['websocket'] });

  socket.on('connect_error', (err) => {
    console.error('Socket connect error', err);
  });

  return socket;
};

export const getSocket = () => socket;

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
