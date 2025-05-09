import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test connection with simple query
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    
    // Get database stats
    const promptCount = await prisma.prompt.count();
    const userCount = await prisma.user.count();
    const creditBucketCount = await prisma.creditBucket.count();
    const transactionCount = await prisma.creditTransaction.count();
    
    // Get latest prompts for debugging
    const latestPrompts = await prisma.prompt.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        isPrivate: true,
        isPublished: true
      }
    });
    
    // Get database connection info with sensitive parts redacted
    let databaseUrl = process.env.DATABASE_URL || 'Not configured';
    if (databaseUrl !== 'Not configured') {
      // Redact password in URL for security
      databaseUrl = databaseUrl.replace(/(postgresql:\/\/[^:]+:)([^@]+)(@.+)/, '$1*****$3');
    }
    
    return NextResponse.json({
      status: 'connected',
      stats: {
        promptCount,
        userCount,
        creditBucketCount,
        transactionCount
      },
      config: {
        databaseProvider: process.env.DATABASE_PROVIDER || 'Not configured',
        databaseUrl,
        useFallback: process.env.USE_DB_FALLBACK === 'true',
        useLocalStorage: process.env.USE_LOCAL_STORAGE === 'true'
      },
      latestPrompts
    });
  } catch (error) {
    console.error('Database debug route error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to database',
      error: (error as Error).message,
      fallbackMode: process.env.USE_DB_FALLBACK === 'true',
      config: {
        databaseProvider: process.env.DATABASE_PROVIDER || 'Not configured',
        isDatabaseUrlSet: !!process.env.DATABASE_URL, 
        useLocalStorage: process.env.USE_LOCAL_STORAGE === 'true'
      }
    }, { status: 500 });
  }
}
