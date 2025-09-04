// test/setup.ts
import { prisma } from '../src/config/prisma';

// Increase test timeout globally
jest.setTimeout(30000);

// Global test cleanup
afterAll(async () => {
  await prisma.$disconnect();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});