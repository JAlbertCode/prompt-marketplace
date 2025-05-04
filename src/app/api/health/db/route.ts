import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/health/db
 * 
 * Check if the database connection is working
 */
export async function GET(req: NextRequest) {
  try {
    // Try to query the database
    const result = await prisma.$queryRaw`SELECT 1 as health`;
    
    return NextResponse.json({
      status: 'ok',
      message: 'Database connection is working',
      result
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}