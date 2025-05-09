import { PrismaClient } from '@prisma/client';
import { prismaFallback } from './db-fallback';

// Define a type for the extended global object
declare global {
  var prisma: PrismaClient | undefined;
}

// Environment config
const USE_FALLBACK = process.env.USE_DB_FALLBACK === 'true';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Prisma client with logging in development only
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: IS_PRODUCTION
      ? undefined
      : ['query', 'error', 'warn'].map((level) => ({
          emit: 'event',
          level,
        })),
  });
};

// Set up global prisma instance to prevent multiple instances during hot reloading
let prisma: PrismaClient;

// Initialize with proper connection handling
if (IS_PRODUCTION) {
  // In production, always use real Prisma client with connection pooling
  prisma = prismaClientSingleton();

  // Set up connection error handling
  prisma.$on('error', (e) => {
    console.error('Prisma Client Error:', e);

    // If fallback is enabled, attempt to switch to fallback mode
    if (USE_FALLBACK) {
      console.warn('Switching to database fallback mode...');
      prisma = prismaFallback;
    }
  });
  
  // Connection pool keep-alive ping (every 30 minutes)
  if (typeof setInterval !== 'undefined') {
    setInterval(() => {
      prisma.$queryRaw`SELECT 1`
        .catch((err) => {
          console.error('Database connection keep-alive failed:', err);
        });
    }, 30 * 60 * 1000);
  }
} else if (USE_FALLBACK) {
  // In development with fallback enabled
  prisma = prismaFallback;
  console.info('Using database fallback mode');
} else {
  // In development with real DB connection
  // Reuse connection during hot reloads
  if (!global.prisma) {
    global.prisma = prismaClientSingleton();
    
    // Set up development logging
    const client = global.prisma;
    client.$on('query', (e: any) => {
      console.log(`Prisma Query (${e.duration}ms):`, e.query);
    });
    client.$on('error', (e: any) => {
      console.error('Prisma Error:', e);
    });
  }
  
  prisma = global.prisma;
}

// Add a safe disconnect method for cleanup/testing
export const disconnectPrisma = async () => {
  if (prisma && prisma !== prismaFallback) {
    await prisma.$disconnect();
  }
};

export { prisma };
