import { PrismaClient } from '@prisma/client';
import { prismaFallback } from './db-fallback';

// Use environment variables to determine if fallback should be used
const USE_FALLBACK = process.env.USE_DB_FALLBACK === 'true';

// If this is in production, don't use fallback
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Create a global prisma instance to be reused across requests
let prisma: PrismaClient;

if (IS_PRODUCTION) {
  // In production, always use real Prisma client
  prisma = new PrismaClient();
} else if (USE_FALLBACK) {
  // In development with fallback enabled
  prisma = prismaFallback;
} else {
  // In development with real DB connection
  // Check if prisma is already defined in the global scope
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export { prisma };
