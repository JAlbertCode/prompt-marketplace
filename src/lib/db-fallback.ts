import { PrismaClient } from '@prisma/client';

// Define mock data types to match Prisma models
export type MockUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
};

export type MockCreditBucket = {
  id: string;
  userId: string;
  type: 'purchased' | 'bonus' | 'referral';
  amount: number;
  remaining: number;
  source: string;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MockCreditTransaction = {
  id: string;
  userId: string;
  modelId: string;
  creditsUsed: number;
  flowId: string | null;
  creatorId: string | null;
  creatorFeePercentage: number;
  itemType: string | null;
  itemId: string | null;
  promptLength: 'short' | 'medium' | 'long';
  createdAt: Date;
  model?: { displayName: string } | null;
  user?: { id: string; name: string | null; image: string | null } | null;
  creator?: { id: string; name: string | null; image: string | null } | null;
};

// Mock data to return when database is unavailable
const mockData = {
  users: [
    {
      id: 'mock-user-1',
      name: 'Demo User',
      email: 'demo@example.com',
      image: null,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ] as MockUser[],
  
  creditBuckets: [
    {
      id: 'mock-bucket-1',
      userId: 'mock-user-1',
      type: 'purchased',
      amount: 10000000,
      remaining: 9500000,
      source: 'initial_purchase',
      expiresAt: null,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    },
    {
      id: 'mock-bucket-2',
      userId: 'mock-user-1',
      type: 'bonus',
      amount: 2000000,
      remaining: 2000000,
      source: 'signup_bonus',
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }
  ] as MockCreditBucket[],
  
  creditTransactions: [
    {
      id: 'mock-tx-1',
      userId: 'mock-user-1',
      modelId: 'gpt-4o',
      creditsUsed: 15000,
      flowId: null,
      creatorId: null,
      creatorFeePercentage: 0,
      itemType: 'completion',
      itemId: null,
      promptLength: 'medium',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      model: { displayName: 'GPT-4o' }
    },
    {
      id: 'mock-tx-2',
      userId: 'mock-user-1',
      modelId: 'gpt-4o-mini',
      creditsUsed: 5000,
      flowId: null,
      creatorId: null,
      creatorFeePercentage: 0,
      itemType: 'completion',
      itemId: null,
      promptLength: 'short',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      model: { displayName: 'GPT-4o Mini' }
    }
  ] as MockCreditTransaction[]
};

// Function to create a fallback Prisma proxy that uses real DB when possible, mock data when not
export function createPrismaFallback() {
  let prisma: PrismaClient;
  let isConnected = false;
  
  // Check if fallback mode is explicitly enabled
  const useFallback = process.env.USE_DB_FALLBACK === 'true';
  
  if (useFallback) {
    console.log('🔄 Using database fallback mode by configuration');
    isConnected = false;
    // Create empty client for type compatibility
    prisma = {} as PrismaClient;
    return createFallbackProxy(prisma, isConnected);
  }
  try {
    // Try to initialize PrismaClient
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    
    // Test connection (will throw if DB connection fails)
    prisma.$connect().then(() => {
      isConnected = true;
      console.log('✅ Database connected successfully');
    }).catch(err => {
      console.error('❌ Database connection failed:', err);
      isConnected = false;
    });
  } catch (error) {
    console.error('❌ Failed to initialize Prisma client:', error);
    isConnected = false;
    
    // Create empty client for type compatibility
    prisma = {} as PrismaClient;
  }
  
  return createFallbackProxy(prisma, isConnected);
}

// Function to create the proxy object with fallback behavior
function createFallbackProxy(prisma: PrismaClient, isConnected: boolean) {
  return new Proxy(prisma, {
    get(target, prop) {
      // If it's a non-model property, return the original
      if (prop !== 'user' && prop !== 'creditBucket' && prop !== 'creditTransaction') {
        return target[prop as keyof typeof target];
      }
      
      // Create a proxy for each model
      return new Proxy({} as any, {
        get(_, method) {
          // Try to use the real DB method first
          const originalMethod = target[prop as keyof typeof target]?.[method as any];
          
          return async (...args: any[]) => {
            if (isConnected && typeof originalMethod === 'function') {
              try {
                // Try to use the real database
                return await originalMethod.apply(target[prop as keyof typeof target], args);
              } catch (error) {
                console.error(`Error in ${String(prop)}.${String(method)}:`, error);
                // Fall back to mock data on error
              }
            }
            
            // If DB is unavailable or the operation failed, use mock data
            console.log(`Using mock data for ${String(prop)}.${String(method)}`);
            
            // Handle common methods for each model
            switch (prop) {
              case 'user':
                return handleUserMethods(method, args);
              case 'creditBucket':
                return handleCreditBucketMethods(method, args);
              case 'creditTransaction':
                return handleCreditTransactionMethods(method, args);
              default:
                return null;
            }
          };
        }
      });
    }
  });
}

// Handle user model operations
function handleUserMethods(method: string | symbol, args: any[]) {
  switch (method) {
    case 'findUnique':
    case 'findFirst':
      return mockData.users[0];
    case 'findMany':
      return mockData.users;
    case 'create':
    case 'update':
      return mockData.users[0];
    default:
      return null;
  }
}

// Handle creditBucket model operations
function handleCreditBucketMethods(method: string | symbol, args: any[]) {
  switch (method) {
    case 'findMany': {
      const options = args[0] || {};
      const userId = options.where?.userId;
      
      if (userId) {
        return mockData.creditBuckets.filter(bucket => bucket.userId === userId);
      }
      return mockData.creditBuckets;
    }
    case 'create': {
      const data = args[0]?.data;
      if (!data) return null;
      
      const newBucket = {
        id: `mock-bucket-${Date.now()}`,
        userId: data.userId,
        type: data.type || 'purchased',
        amount: data.amount || 0,
        remaining: data.remaining || data.amount || 0,
        source: data.source || 'manual_addition',
        expiresAt: data.expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add to mock data (for persistence during session)
      mockData.creditBuckets.push(newBucket);
      return newBucket;
    }
    case 'update': {
      const where = args[0]?.where;
      const data = args[0]?.data;
      if (!where || !data) return null;
      
      const bucketIndex = mockData.creditBuckets.findIndex(b => b.id === where.id);
      if (bucketIndex >= 0) {
        // Update the bucket
        mockData.creditBuckets[bucketIndex] = {
          ...mockData.creditBuckets[bucketIndex],
          ...data,
          updatedAt: new Date()
        };
        return mockData.creditBuckets[bucketIndex];
      }
      return null;
    }
    default:
      return null;
  }
}

// Handle creditTransaction model operations
function handleCreditTransactionMethods(method: string | symbol, args: any[]) {
  switch (method) {
    case 'findMany': {
      const options = args[0] || {};
      const userId = options.where?.userId || options.where?.OR?.[0]?.userId;
      const limit = options.take || 10;
      const offset = options.skip || 0;
      
      let results = [...mockData.creditTransactions];
      
      // Filter by userId if specified
      if (userId) {
        results = results.filter(tx => 
          tx.userId === userId || tx.creatorId === userId
        );
      }
      
      // Sort by createdAt desc (newest first)
      results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      // Apply pagination
      return results.slice(offset, offset + limit);
    }
    case 'create': {
      const data = args[0]?.data;
      if (!data) return null;
      
      const newTransaction = {
        id: `mock-tx-${Date.now()}`,
        userId: data.userId,
        modelId: data.modelId,
        creditsUsed: data.creditsUsed || 0,
        flowId: data.flowId || null,
        creatorId: data.creatorId || null,
        creatorFeePercentage: data.creatorFeePercentage || 0,
        itemType: data.itemType || 'completion',
        itemId: data.itemId || null,
        promptLength: data.promptLength || 'medium',
        createdAt: new Date(),
        model: { displayName: data.modelId }
      };
      
      // Add to mock data (for persistence during session)
      mockData.creditTransactions.push(newTransaction);
      return newTransaction;
    }
    default:
      return null;
  }
}

// Create the instance
const prismaFallback = createPrismaFallback();

export { prismaFallback };
