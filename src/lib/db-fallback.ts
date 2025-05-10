import { PrismaClient } from '@prisma/client';
import { randomInt } from 'crypto';

/**
 * Fallback Database Handling
 * 
 * This file provides fallback functionality for when the database connection fails.
 * It creates mocked data and responses for development and testing purposes.
 */

// Mock data for credit buckets
const MOCK_CREDIT_BUCKETS = [
  {
    id: 'mock-bucket-1',
    userId: '',
    type: 'purchased',
    amount: 25000000,
    remaining: 22567890,
    source: 'stripe',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  },
  {
    id: 'mock-bucket-2',
    userId: '',
    type: 'bonus',
    amount: 2500000,
    remaining: 1987654,
    source: 'referral',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
  },
  {
    id: 'mock-bucket-3',
    userId: '',
    type: 'bonus',
    amount: 10000,
    remaining: 10000,
    source: 'welcome',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
  }
];

// Mock data for credit transactions
const MODEL_IDS = ['gpt-4o', 'gpt-4o-mini', 'sonar-pro-medium', 'sonar-reasoning-pro-low'];
const ITEM_TYPES = ['prompt', 'completion', 'flow', 'purchased', 'bonus'];

// Generate mock transaction history
function generateMockTransactions(userId: string, count: number = 50) {
  const transactions = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 60); // Random date within the last 60 days
    const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    
    const modelId = MODEL_IDS[Math.floor(Math.random() * MODEL_IDS.length)];
    const itemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    
    // Credits used varies by type
    let creditsUsed = 0;
    let creditorId = null;
    
    if (itemType === 'purchased' || itemType === 'bonus') {
      creditsUsed = Math.floor(Math.random() * 10000000) + 1000000; // 1M to 11M for purchases
    } else {
      creditsUsed = Math.floor(Math.random() * 50000) + 1000; // 1k to 51k for usage
      
      // Occasionally add a creator fee
      if (Math.random() > 0.7) {
        creditorId = 'creator-' + Math.floor(Math.random() * 1000);
      }
    }
    
    transactions.push({
      id: `mock-tx-${i}`,
      userId,
      modelId,
      itemType,
      creditsUsed,
      creditorId,
      createdAt,
      model: {
        displayName: modelId.charAt(0).toUpperCase() + modelId.slice(1).replace(/-/g, ' ')
      }
    });
  }
  
  // Sort by date, newest first
  return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Create a fallback proxy handler for database operations
 */
function createFallbackProxy(target: any, isConnected: boolean) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      // If connected, use actual Prisma client
      if (isConnected) {
        return Reflect.get(target, prop, receiver);
      }
      
      // Handle transaction method
      if (prop === '$transaction') {
        return async (callback: any) => {
          console.log('Using mock transaction');
          // Just execute the callback directly with our proxy as the transaction client
          return await callback(receiver);
        };
      }
      
      // Handle each model's fallback operations
      switch (prop) {
        case 'creditBucket':
          return {
            findMany: async (args: any) => {
              console.log('Using mock data for creditBucket.findMany');
              
              // Set userId from the query
              const userId = args?.where?.userId || 'anonymous';
              const buckets = MOCK_CREDIT_BUCKETS.map(bucket => ({
                ...bucket,
                userId
              }));
              
              return buckets;
            },
            create: async (args: any) => {
              console.log('Using mock data for creditBucket.create');
              const newBucket = {
                id: `mock-bucket-${randomInt(1000, 9999)}`,
                ...args.data,
                createdAt: new Date()
              };
              return newBucket;
            },
            updateMany: async (args: any) => {
              console.log('Using mock data for creditBucket.updateMany');
              return { count: Math.floor(Math.random() * 3) + 1 };
            }
          };
          
        case 'creditTransaction':
          return {
            findMany: async (args: any) => {
              console.log('Using mock data for creditTransaction.findMany');
              
              const userId = args?.where?.userId || 'anonymous';
              const transactions = generateMockTransactions(userId);
              
              // Apply pagination if specified
              const limit = args?.take || transactions.length;
              const offset = args?.skip || 0;
              
              return transactions.slice(offset, offset + limit);
            },
            create: async (args: any) => {
              console.log('Using mock data for creditTransaction.create');
              const newTransaction = {
                id: `mock-tx-${randomInt(1000, 9999)}`,
                ...args.data,
                createdAt: new Date()
              };
              return newTransaction;
            },
            count: async (args: any) => {
              return Math.floor(Math.random() * 100) + 50; // Return random count between 50-150
            }
          };
          
        default:
          // For any other model, return a mock object with standard methods
          return {
            findMany: async () => [],
            findUnique: async () => null,
            findFirst: async () => null,
            create: async (args: any) => args.data,
            update: async (args: any) => args.data,
            delete: async () => ({}),
            count: async () => 0
          };
      }
    }
  });
}

/**
 * Create a Prisma client with fallback capabilities
 */
export function createPrismaFallback(shouldUseFallback: boolean = false): PrismaClient {
  let prisma: PrismaClient;
  let isConnected = false;
  
  // If explicitly configured to use fallback, don't even try to connect
  if (shouldUseFallback) {
    console.log('🔄 Using database fallback mode by configuration');
    // Create empty client for type compatibility
    prisma = {} as PrismaClient;
    return createFallbackProxy(prisma, isConnected);
  }
  
  try {
    // Try to initialize PrismaClient
    prisma = new PrismaClient();
    
    // Test connection
    prisma.$connect()
      .then(() => {
        console.log('✅ Database connection established');
        isConnected = true;
      })
      .catch((err) => {
        console.error('❌ Database connection failed:', err);
        console.log('Failed to connect to database, using fallback mode:', err);
        isConnected = false;
      });
      
    return createFallbackProxy(prisma, isConnected);
  } catch (err) {
    console.error('❌ Failed to initialize Prisma client:', err);
    
    // Create empty client as fallback
    prisma = {} as PrismaClient;
    return createFallbackProxy(prisma, false);
  }
}

// Export a fallback Prisma client
export const prismaFallback = createPrismaFallback(
  process.env.USE_DB_FALLBACK === 'true'
);
