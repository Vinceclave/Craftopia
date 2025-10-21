import { createServer } from 'http';
import app from './app';
import { config } from './config';
import prisma from './config/prisma';
import { initializeWebSocket } from './websocket/server';

const PORT = config.port;

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket
const wsServer = initializeWebSocket(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at: http://localhost:${PORT}/api/v1`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`🔌 WebSocket server running`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('🔄 Received shutdown signal, closing server...');
  
  httpServer.close(async () => {
    console.log('✅ HTTP server closed');
    
    try {
      await prisma.$disconnect();
      console.log('✅ Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database:', error);
    }
    
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err.message);
  shutdown();
});

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err.message);
  shutdown();
});

// Export for use in services
export { wsServer };
