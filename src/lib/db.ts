import { PrismaClient } from '@prisma/client';
import { prismaFallback } from './db-fallback';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Check if fallback mode is explicitly enabled
const useFallback = process.env.USE_DB_FALLBACK === 'true';

// Determine which Prisma client to use
let clientToUse: any;

if (useFallback) {
  console.log('🔄 Using database fallback mode by configuration');
  clientToUse = prismaFallback;
} else {
  // First try to use the regular Prisma client
  try {
    clientToUse = globalForPrisma.prisma ||
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = clientToUse;
    }

    // Test database connection and switch to fallback if needed
    clientToUse.$connect()
      .catch(error => {
        console.error('❌ Failed to connect to database, using fallback mode:', error);
        console.log('➡️ Set USE_DB_FALLBACK=true in .env to avoid this error');
        clientToUse = prismaFallback;
        (global as any).prisma = prismaFallback;
      });
  } catch (error) {
    console.error('❌ Error initializing standard Prisma client:', error);
    console.log('➡️ Switching to fallback mode');
    clientToUse = prismaFallback;
  }
}

// Export the chosen client implementation
export const prisma = clientToUse;