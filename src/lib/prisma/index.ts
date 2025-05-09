// Import PrismaClient
import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a singleton instance of PrismaClient
export const prisma = global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Set global prisma in development to prevent hot-reloading issues
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
