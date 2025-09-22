import app from './app';
import { config } from './config';
import prisma from './config/prisma';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at: http://localhost:${PORT}/api/v1`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/v1/health`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('🔄 Received shutdown signal, closing server...');
  
  server.close(async () => {
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err.message);
  shutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err.message);
  shutdown();
});