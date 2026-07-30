import http from 'http';
import app from './app';
import { initSocketServer } from './services/socket';
import { seedDatabase } from './utils/seed';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
initSocketServer(server);

// Seed DB and start HTTP server
seedDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`
  ======================================================
    🚀 CampusFetch Logistics Server Running on Port ${PORT}
    Campus: Amrita Vishwa Vidyapeetham
    Environment: ${process.env.NODE_ENV || 'development'}
    Realtime Socket.IO: Connected
  ======================================================
    `);
  });
}).catch((err) => {
  console.error('Failed to seed DB, starting server anyway:', err);
  server.listen(PORT, () => {
    console.log(`🚀 CampusFetch Server listening on port ${PORT}`);
  });
});
